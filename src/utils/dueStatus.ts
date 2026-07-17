import { DueLevel, DueStatus, OilChangeLog, Vehicle } from '@/types';
import { addMonthsToISODate, daysBetween, todayISODate } from '@/utils/date';

/**
 * Computes next-due mileage/date and overall status using "whichever comes first" logic:
 * the worse of the mileage track and the date track wins.
 *
 * Baseline for the calculation is the most recent oil change log, falling back to the
 * vehicle's baseline odometer reading / profile creation date when no log exists yet.
 */
export function computeDueStatus(vehicle: Vehicle, mostRecentLog: OilChangeLog | null, today: string = todayISODate()): DueStatus {
  const baselineMileage = mostRecentLog?.mileage ?? vehicle.baselineOdometer ?? null;
  const baselineDate = mostRecentLog?.date ?? vehicle.createdAt.slice(0, 10);

  const nextDueMileage =
    vehicle.manualNextDueMileage ??
    (vehicle.intervalMiles != null && baselineMileage != null ? baselineMileage + vehicle.intervalMiles : null);

  const nextDueDate =
    vehicle.manualNextDueDate ?? (vehicle.intervalMonths != null ? addMonthsToISODate(baselineDate, vehicle.intervalMonths) : null);

  const milesRemaining = nextDueMileage != null && vehicle.currentOdometer != null ? nextDueMileage - vehicle.currentOdometer : null;

  const daysRemaining = nextDueDate != null ? daysBetween(today, nextDueDate) : null;

  const mileageLevel = levelForRemaining(milesRemaining, vehicle.reminderThresholdMiles);
  const dateLevel = levelForRemaining(daysRemaining, vehicle.reminderThresholdDays);

  const level = worseLevel(mileageLevel, dateLevel);

  let reason: DueStatus['reason'] = null;
  if (level !== 'unknown') {
    const mileageMatches = mileageLevel === level;
    const dateMatches = dateLevel === level;
    if (mileageMatches && dateMatches) reason = 'both';
    else if (mileageMatches) reason = 'mileage';
    else if (dateMatches) reason = 'date';
  }

  return { nextDueMileage, nextDueDate, milesRemaining, daysRemaining, level, reason };
}

function levelForRemaining(remaining: number | null, threshold: number): DueLevel {
  if (remaining == null) return 'unknown';
  if (remaining <= 0) return 'overdue';
  if (remaining <= threshold) return 'due_soon';
  return 'ok';
}

const LEVEL_SEVERITY: Record<DueLevel, number> = { unknown: -1, ok: 0, due_soon: 1, overdue: 2 };

function worseLevel(a: DueLevel, b: DueLevel): DueLevel {
  if (a === 'unknown' && b === 'unknown') return 'unknown';
  if (a === 'unknown') return b;
  if (b === 'unknown') return a;
  return LEVEL_SEVERITY[a] >= LEVEL_SEVERITY[b] ? a : b;
}

/** A short human-readable summary of when the next oil change is due, e.g. "Due in 200 mi / 15 days". */
export function describeDueStatus(status: DueStatus): string {
  const parts: string[] = [];
  if (status.milesRemaining != null) {
    parts.push(status.milesRemaining >= 0 ? `${status.milesRemaining} mi left` : `${Math.abs(status.milesRemaining)} mi overdue`);
  }
  if (status.daysRemaining != null) {
    parts.push(status.daysRemaining >= 0 ? `${status.daysRemaining} days left` : `${Math.abs(status.daysRemaining)} days overdue`);
  }
  if (parts.length === 0) return 'Set an interval to track when the next oil change is due.';
  return parts.join(' · ');
}

export function mostRecentLog(logs: OilChangeLog[]): OilChangeLog | null {
  if (logs.length === 0) return null;
  return logs.reduce((latest, log) => {
    if (log.date !== latest.date) return log.date > latest.date ? log : latest;
    return log.mileage > latest.mileage ? log : latest;
  });
}
