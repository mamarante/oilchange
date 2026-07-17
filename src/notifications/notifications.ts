import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { DueStatus, Vehicle } from '@/types';
import { addDaysToISODate, todayISODate } from '@/utils/date';

const CHANNEL_ID = 'oil-change-reminders';
const CATEGORY_ID = 'oil-reminder';
const SNOOZE_ACTION = 'SNOOZE';
const DISMISS_ACTION = 'DISMISS';

/** Local scheduled notifications aren't meaningfully supported on web; every export below is a no-op there. */
const IS_WEB = Platform.OS === 'web';

/** Days to nudge the "update your mileage" reminder forward each cycle. */
const ODOMETER_NUDGE_INTERVAL_DAYS = 14;

function dueDateReminderId(vehicleId: string): string {
  return `due-date-${vehicleId}`;
}

function odometerNudgeId(vehicleId: string): string {
  return `odometer-nudge-${vehicleId}`;
}

/** Sets up the notification handler, Android channel, and snooze/dismiss category. Call once at app startup. */
export async function configureNotifications(): Promise<void> {
  if (IS_WEB) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Oil change reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
    { identifier: SNOOZE_ACTION, buttonTitle: 'Snooze 1 day' },
    { identifier: DISMISS_ACTION, buttonTitle: 'Dismiss', options: { isDestructive: true } },
  ]);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (IS_WEB) return false;
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return requested.granted;
}

/** Wires up the "Snooze 1 day" action so it reschedules the same reminder for tomorrow morning. Call once at app startup. */
export function registerNotificationResponseHandler() {
  if (IS_WEB) return { remove() {} };

  return Notifications.addNotificationResponseReceivedListener(async (response) => {
    if (response.actionIdentifier !== SNOOZE_ACTION) return;
    const { title, body } = response.notification.request.content;
    const data = response.notification.request.content.data as { vehicleId?: string; kind?: string } | undefined;
    if (!data?.vehicleId || data.kind !== 'due-date') return;

    await Notifications.scheduleNotificationAsync({
      identifier: dueDateReminderId(data.vehicleId),
      content: { title: title ?? 'Oil change reminder', body: body ?? undefined, categoryIdentifier: CATEGORY_ID, data },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 24 * 60 * 60 },
    });
  });
}

async function cancelIfScheduled(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // Not scheduled — nothing to cancel.
  }
}

function nextTriggerAt9am(isoDate: string): Date {
  const date = new Date(isoDate + 'T09:00:00');
  if (date.getTime() <= Date.now()) {
    return new Date(Date.now() + 5000);
  }
  return date;
}

function vehicleLabel(vehicle: Vehicle): string {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

/** Schedules (or reschedules) the date-based due reminder for a vehicle based on its current due status. */
export async function scheduleDueDateReminder(vehicle: Vehicle, status: DueStatus): Promise<void> {
  if (IS_WEB) return;
  const identifier = dueDateReminderId(vehicle.id);
  await cancelIfScheduled(identifier);

  if (!status.nextDueDate) return;

  const reminderDate = addDaysToISODate(status.nextDueDate, -vehicle.reminderThresholdDays);
  const isAlreadyDue = status.level === 'due_soon' || status.level === 'overdue';
  const fireDate = isAlreadyDue ? new Date(Date.now() + 5000) : nextTriggerAt9am(reminderDate);

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: `Oil change due soon — ${vehicleLabel(vehicle)}`,
      body:
        status.level === 'overdue'
          ? `Overdue: next oil change was due ${status.nextDueDate}.`
          : `Next oil change is due ${status.nextDueDate}.`,
      categoryIdentifier: CATEGORY_ID,
      data: { vehicleId: vehicle.id, kind: 'due-date' },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate },
  });
}

/** Ensures a periodic "update your mileage" nudge is scheduled for a vehicle, without resetting an existing one. */
export async function ensureOdometerNudgeScheduled(vehicle: Vehicle): Promise<void> {
  if (IS_WEB) return;
  const identifier = odometerNudgeId(vehicle.id);
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  if (scheduled.some((n) => n.identifier === identifier)) return;

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: `Update ${vehicleLabel(vehicle)}'s mileage`,
      body: 'Keeping your odometer reading current helps oil change due dates stay accurate.',
      data: { vehicleId: vehicle.id, kind: 'odometer-nudge' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: ODOMETER_NUDGE_INTERVAL_DAYS * 24 * 60 * 60,
      repeats: true,
    },
  });
}

/** Presents an immediate local notification if the vehicle is due-soon/overdue by mileage right now. */
export async function notifyIfMileageDueNow(vehicle: Vehicle, status: DueStatus): Promise<void> {
  if (IS_WEB) return;
  if (status.reason !== 'mileage' && status.reason !== 'both') return;
  if (status.level !== 'due_soon' && status.level !== 'overdue') return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Oil change ${status.level === 'overdue' ? 'overdue' : 'due soon'} — ${vehicleLabel(vehicle)}`,
      body:
        status.level === 'overdue'
          ? `Overdue by ${Math.abs(status.milesRemaining ?? 0)} miles.`
          : `Due in ${status.milesRemaining} miles.`,
      categoryIdentifier: CATEGORY_ID,
      data: { vehicleId: vehicle.id, kind: 'mileage-due' },
    },
    trigger: null,
  });
}

/** Keeps a vehicle's scheduled reminders in sync with its current due status. */
export async function syncRemindersForVehicle(vehicle: Vehicle, status: DueStatus): Promise<void> {
  await scheduleDueDateReminder(vehicle, status);
  await ensureOdometerNudgeScheduled(vehicle);
}

export async function cancelRemindersForVehicle(vehicleId: string): Promise<void> {
  if (IS_WEB) return;
  await cancelIfScheduled(dueDateReminderId(vehicleId));
  await cancelIfScheduled(odometerNudgeId(vehicleId));
}

export { todayISODate };
