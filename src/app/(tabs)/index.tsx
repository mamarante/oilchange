import { useRouter } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VehicleCard } from '@/components/vehicle-card';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAppData } from '@/context/AppDataContext';
import { useVehiclesWithStatus } from '@/hooks/use-due-status';

export default function VehiclesScreen() {
  const router = useRouter();
  const { loading } = useAppData();
  const vehiclesWithStatus = useVehiclesWithStatus();

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['left', 'right', 'bottom']}>
        <FlatList
          data={vehiclesWithStatus}
          keyExtractor={(item) => item.vehicle.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <VehicleCard item={item} onPress={() => router.push({ pathname: '/vehicle/[id]', params: { id: item.vehicle.id } })} />
          )}
          ListEmptyComponent={
            !loading ? (
              <ThemedView style={styles.empty}>
                <ThemedText type="subtitle" style={styles.emptyTitle}>
                  No vehicles yet
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.emptyBody}>
                  Add a vehicle to start tracking its oil change history and reminders.
                </ThemedText>
              </ThemedView>
            ) : null
          }
          ListFooterComponent={
            <ThemedView style={styles.footer}>
              <PrimaryButton label="Add Vehicle" onPress={() => router.push('/vehicle/new')} />
            </ThemedView>
          }
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
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
  },
  empty: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    gap: Spacing.two,
  },
  emptyTitle: {
    fontSize: 20,
    textAlign: 'center',
  },
  emptyBody: {
    textAlign: 'center',
  },
  footer: {
    marginTop: Spacing.two,
  },
});
