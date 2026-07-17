import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { OIL_TYPE_LABELS, OilChangeLog } from '@/types';
import { formatDateDisplay } from '@/utils/date';

export function LogListItem({ log, onPress }: { log: OilChangeLog; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView type="backgroundElement" style={styles.row}>
        <ThemedView type="backgroundElement" style={styles.line}>
          <ThemedText type="smallBold">{formatDateDisplay(log.date)}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {log.mileage.toLocaleString()} mi
          </ThemedText>
        </ThemedView>
        <ThemedText type="small" themeColor="textSecondary">
          {OIL_TYPE_LABELS[log.oilType]}
          {log.oilBrand ? ` · ${log.oilBrand}` : ''}
        </ThemedText>
        {log.filterBrand ? (
          <ThemedText type="small" themeColor="textSecondary">
            Filter: {log.filterBrand}
          </ThemedText>
        ) : null}
        {log.notes ? <ThemedText type="small">{log.notes}</ThemedText> : null}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
