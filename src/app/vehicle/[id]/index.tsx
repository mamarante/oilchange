import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { DueStatusBadge } from '@/components/due-status-badge';
import { LogListItem } from '@/components/log-list-item';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useVehicleWithStatus } from '@/hooks/use-due-status';
import { describeDueStatus } from '@/utils/dueStatus';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const result = useVehicleWithStatus(id);

  if (!result) {
    return (
      <ScreenScrollView>
        <ThemedText>Vehicle not found.</ThemedText>
      </ScreenScrollView>
    );
  }

  const { vehicle, logs, status } = result;
  const recentLogs = logs.slice(0, 3);

  return (
    <ScreenScrollView>
      <Stack.Screen
        options={{
          title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          headerRight: () => (
            <ThemedText type="link" onPress={() => router.push({ pathname: '/vehicle/[id]/edit', params: { id: vehicle.id } })}>
              Edit
            </ThemedText>
          ),
        }}
      />

      <ThemedView type="backgroundElement" style={styles.statusCard}>
        <DueStatusBadge level={status.level} />
        <ThemedText type="subtitle" style={styles.statusHeadline}>
          {describeDueStatus(status)}
        </ThemedText>
        {status.nextDueMileage != null && <ThemedText themeColor="textSecondary">Next due at {status.nextDueMileage.toLocaleString()} mi</ThemedText>}
        {status.nextDueDate != null && <ThemedText themeColor="textSecondary">Next due by {status.nextDueDate}</ThemedText>}
        {vehicle.currentOdometer != null && (
          <ThemedText themeColor="textSecondary">Current odometer: {vehicle.currentOdometer.toLocaleString()} mi</ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.actions}>
        <PrimaryButton label="Log Oil Change" onPress={() => router.push({ pathname: '/vehicle/[id]/log/new', params: { id: vehicle.id } })} />
        <PrimaryButton
          label="Update Odometer"
          variant="secondary"
          onPress={() => router.push({ pathname: '/vehicle/[id]/odometer', params: { id: vehicle.id } })}
        />
      </ThemedView>

      <ThemedView style={styles.historySection}>
        <ThemedView style={styles.historyHeader}>
          <ThemedText type="subtitle" style={styles.historyTitle}>
            Recent Service
          </ThemedText>
          {logs.length > 0 && (
            <ThemedText type="link" onPress={() => router.push({ pathname: '/vehicle/[id]/history', params: { id: vehicle.id } })}>
              View all ({logs.length})
            </ThemedText>
          )}
        </ThemedView>
        {recentLogs.length === 0 ? (
          <ThemedText themeColor="textSecondary">No oil changes logged yet.</ThemedText>
        ) : (
          recentLogs.map((log) => (
            <LogListItem
              key={log.id}
              log={log}
              onPress={() => router.push({ pathname: '/vehicle/[id]/log/[logId]', params: { id: vehicle.id, logId: log.id } })}
            />
          ))
        )}
      </ThemedView>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  statusHeadline: {
    fontSize: 20,
  },
  actions: {
    gap: Spacing.two,
  },
  historySection: {
    gap: Spacing.two,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 20,
  },
});
