import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogListItem } from '@/components/log-list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useVehicleWithStatus } from '@/hooks/use-due-status';

export default function ServiceHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const result = useVehicleWithStatus(id);

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['left', 'right', 'bottom']}>
        <FlatList
          data={result?.logs ?? []}
          keyExtractor={(log) => log.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: log }) => (
            <LogListItem log={log} onPress={() => router.push({ pathname: '/vehicle/[id]/log/[logId]', params: { id: id!, logId: log.id } })} />
          )}
          ListEmptyComponent={<ThemedText themeColor="textSecondary">No oil changes logged yet.</ThemedText>}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  list: {
    padding: Spacing.three,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
  },
});
