import { useRouter } from 'expo-router';

import { ScreenScrollView } from '@/components/screen-scroll-view';
import { VehicleForm } from '@/components/vehicle-form';
import { useAppData } from '@/context/AppDataContext';
import { NewVehicle } from '@/types';

export default function NewVehicleScreen() {
  const router = useRouter();
  const { addVehicle } = useAppData();

  async function handleSubmit(input: NewVehicle) {
    const vehicle = await addVehicle(input);
    router.replace({ pathname: '/vehicle/[id]', params: { id: vehicle.id } });
  }

  return (
    <ScreenScrollView>
      <VehicleForm onSubmit={handleSubmit} submitLabel="Add Vehicle" />
    </ScreenScrollView>
  );
}
