import { useLocalSearchParams, useRouter } from 'expo-router';

import { LogForm } from '@/components/log-form';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { useAppData } from '@/context/AppDataContext';
import { NewOilChangeLog } from '@/types';

export default function EditLogScreen() {
  const { id, logId } = useLocalSearchParams<{ id: string; logId: string }>();
  const router = useRouter();
  const { logsByVehicle, editLog, removeLog } = useAppData();
  const log = (logsByVehicle[id!] ?? []).find((l) => l.id === logId);

  async function handleSubmit(input: NewOilChangeLog) {
    if (!log) return;
    await editLog(log.id, log.vehicleId, input);
    router.back();
  }

  async function handleDelete() {
    if (!log) return;
    await removeLog(log.id, log.vehicleId);
    router.back();
  }

  if (!log) {
    return (
      <ScreenScrollView>
        <ThemedText>Log entry not found.</ThemedText>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <LogForm vehicleId={log.vehicleId} initial={log} onSubmit={handleSubmit} submitLabel="Save Changes" />
      <PrimaryButton label="Delete Entry" variant="destructive" onPress={handleDelete} />
    </ScreenScrollView>
  );
}
