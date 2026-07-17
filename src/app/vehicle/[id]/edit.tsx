import { useLocalSearchParams, useRouter } from 'expo-router';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { VehicleForm } from '@/components/vehicle-form';
import { useAppData } from '@/context/AppDataContext';
import { NewVehicle } from '@/types';

export default function EditVehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { vehicles, editVehicle, removeVehicle } = useAppData();
  const vehicle = vehicles.find((v) => v.id === id);

  async function handleSubmit(input: NewVehicle) {
    if (!vehicle) return;
    await editVehicle(vehicle.id, input);
    router.back();
  }

  async function handleDelete() {
    if (!vehicle) return;
    await removeVehicle(vehicle.id);
    router.dismissTo('/(tabs)');
  }

  if (!vehicle) {
    return (
      <ScreenScrollView>
        <ThemedText>Vehicle not found.</ThemedText>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <VehicleForm initial={vehicle} onSubmit={handleSubmit} submitLabel="Save Changes" />
      <PrimaryButton label="Delete Vehicle" variant="destructive" onPress={handleDelete} />
    </ScreenScrollView>
  );
}
