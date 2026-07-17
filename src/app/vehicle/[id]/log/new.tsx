import { useLocalSearchParams, useRouter } from 'expo-router';

import { LogForm } from '@/components/log-form';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { useAppData } from '@/context/AppDataContext';
import { useVehicleWithStatus } from '@/hooks/use-due-status';
import { NewOilChangeLog } from '@/types';

export default function NewLogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addLog } = useAppData();
  const result = useVehicleWithStatus(id);

  async function handleSubmit(input: NewOilChangeLog) {
    await addLog(input);
    router.back();
  }

  if (!result) {
    return (
      <ScreenScrollView>
        <ThemedText>Vehicle not found.</ThemedText>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <LogForm
        vehicleId={result.vehicle.id}
        suggestedMileage={result.vehicle.currentOdometer ?? result.lastLog?.mileage}
        onSubmit={handleSubmit}
        submitLabel="Save"
      />
    </ScreenScrollView>
  );
}
