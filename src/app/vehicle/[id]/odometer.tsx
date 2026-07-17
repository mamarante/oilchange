import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { DateField } from '@/components/form/date-field';
import { TextField } from '@/components/form/text-field';
import { PrimaryButton } from '@/components/primary-button';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { useAppData } from '@/context/AppDataContext';
import { todayISODate } from '@/utils/date';

export default function UpdateOdometerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { vehicles, updateOdometer } = useAppData();
  const vehicle = vehicles.find((v) => v.id === id);

  const [odometer, setOdometer] = useState(vehicle?.currentOdometer != null ? String(vehicle.currentOdometer) : '');
  const [date, setDate] = useState(todayISODate());
  const [submitting, setSubmitting] = useState(false);

  const odometerNumber = Number(odometer);
  const canSubmit = odometer.trim() !== '' && Number.isFinite(odometerNumber) && odometerNumber >= 0;

  async function handleSubmit() {
    if (!vehicle || !canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await updateOdometer(vehicle.id, odometerNumber, date);
      router.back();
    } finally {
      setSubmitting(false);
    }
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
      <ThemedText themeColor="textSecondary">
        Update the current mileage for {vehicle.year} {vehicle.make} {vehicle.model} so due-date calculations stay accurate.
      </ThemedText>
      <TextField label="Current odometer" value={odometer} onChangeText={setOdometer} keyboardType="number-pad" placeholder="45000" />
      <DateField label="As of" value={date} onChange={setDate} />
      <PrimaryButton label={submitting ? 'Saving…' : 'Save'} onPress={handleSubmit} disabled={!canSubmit || submitting} />
    </ScreenScrollView>
  );
}
