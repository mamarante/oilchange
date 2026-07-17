import { Pressable, StyleSheet } from 'react-native';

import { DueStatusBadge } from '@/components/due-status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { VehicleWithStatus } from '@/hooks/use-due-status';
import { describeDueStatus } from '@/utils/dueStatus';

export function VehicleCard({ item, onPress }: { item: VehicleWithStatus; onPress: () => void }) {
  const { vehicle, status } = item;

  return (
    <Pressable onPress={onPress}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedView type="backgroundElement" style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </ThemedText>
          <DueStatusBadge level={status.level} />
        </ThemedView>
        {vehicle.engineSize ? (
          <ThemedText type="small" themeColor="textSecondary">
            {vehicle.engineSize}
          </ThemedText>
        ) : null}
        <ThemedText type="small" themeColor="textSecondary">
          {describeDueStatus(status)}
        </ThemedText>
        {vehicle.currentOdometer != null ? (
          <ThemedText type="small" themeColor="textSecondary">
            Odometer: {vehicle.currentOdometer.toLocaleString()} mi
          </ThemedText>
        ) : null}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    flexShrink: 1,
  },
});
