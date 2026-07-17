import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useStatusColors } from '@/hooks/use-theme';
import { DueLevel } from '@/types';

const LABELS: Record<DueLevel, string> = {
  unknown: 'No interval set',
  ok: 'OK',
  due_soon: 'Due soon',
  overdue: 'Overdue',
};

export function DueStatusBadge({ level }: { level: DueLevel }) {
  const statusColors = useStatusColors();
  const colors = statusColors[level];

  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <ThemedText type="smallBold" style={{ color: colors.text }}>
        {LABELS[level]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    alignSelf: 'flex-start',
  },
});
