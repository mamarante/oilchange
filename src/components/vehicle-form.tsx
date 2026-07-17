import { useState } from 'react';

import { DateField } from '@/components/form/date-field';
import { TextField } from '@/components/form/text-field';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { NewVehicle, Vehicle } from '@/types';
import { todayISODate } from '@/utils/date';

interface VehicleFormProps {
  initial?: Vehicle;
  onSubmit: (input: NewVehicle) => Promise<void>;
  submitLabel: string;
}

function toNumberOrNull(text: string): number | null {
  if (text.trim() === '') return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

export function VehicleForm({ initial, onSubmit, submitLabel }: VehicleFormProps) {
  const [year, setYear] = useState(initial ? String(initial.year) : String(new Date().getFullYear()));
  const [make, setMake] = useState(initial?.make ?? '');
  const [model, setModel] = useState(initial?.model ?? '');
  const [engineSize, setEngineSize] = useState(initial?.engineSize ?? '');
  const [intervalMiles, setIntervalMiles] = useState(initial ? String(initial.intervalMiles ?? '') : '5000');
  const [intervalMonths, setIntervalMonths] = useState(initial ? String(initial.intervalMonths ?? '') : '6');
  const [reminderThresholdMiles, setReminderThresholdMiles] = useState(String(initial?.reminderThresholdMiles ?? 300));
  const [reminderThresholdDays, setReminderThresholdDays] = useState(String(initial?.reminderThresholdDays ?? 7));
  const [currentOdometer, setCurrentOdometer] = useState(initial ? String(initial.currentOdometer ?? '') : '');
  const [manualNextDueMileage, setManualNextDueMileage] = useState(initial ? String(initial.manualNextDueMileage ?? '') : '');
  const [manualNextDueDate, setManualNextDueDate] = useState(initial?.manualNextDueDate ?? '');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = year.trim() !== '' && make.trim() !== '' && model.trim() !== '';

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        year: Number(year),
        make: make.trim(),
        model: model.trim(),
        engineSize: engineSize.trim() || null,
        intervalMiles: toNumberOrNull(intervalMiles),
        intervalMonths: toNumberOrNull(intervalMonths),
        reminderThresholdMiles: toNumberOrNull(reminderThresholdMiles) ?? 300,
        reminderThresholdDays: toNumberOrNull(reminderThresholdDays) ?? 7,
        currentOdometer: toNumberOrNull(currentOdometer),
        currentOdometerUpdatedAt: toNumberOrNull(currentOdometer) != null ? (initial?.currentOdometerUpdatedAt ?? todayISODate()) : null,
        manualNextDueMileage: toNumberOrNull(manualNextDueMileage),
        manualNextDueDate: manualNextDueDate.trim() || null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={{ gap: Spacing.three }}>
      <TextField label="Year" value={year} onChangeText={setYear} keyboardType="number-pad" placeholder="2020" />
      <TextField label="Make" value={make} onChangeText={setMake} placeholder="Honda" />
      <TextField label="Model" value={model} onChangeText={setModel} placeholder="Civic" />
      <TextField label="Engine size (optional)" value={engineSize} onChangeText={setEngineSize} placeholder="1.5L Turbo" />

      <ThemedText type="subtitle" style={{ fontSize: 20 }}>
        Oil change interval
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Set either or both — the app reminds you whichever comes first.
      </ThemedText>
      <TextField label="Interval (miles)" value={intervalMiles} onChangeText={setIntervalMiles} keyboardType="number-pad" placeholder="5000" />
      <TextField label="Interval (months)" value={intervalMonths} onChangeText={setIntervalMonths} keyboardType="number-pad" placeholder="6" />

      <ThemedText type="subtitle" style={{ fontSize: 20 }}>
        Reminder lead time
      </ThemedText>
      <TextField
        label="Remind me this many miles before"
        value={reminderThresholdMiles}
        onChangeText={setReminderThresholdMiles}
        keyboardType="number-pad"
        placeholder="300"
      />
      <TextField
        label="Remind me this many days before"
        value={reminderThresholdDays}
        onChangeText={setReminderThresholdDays}
        keyboardType="number-pad"
        placeholder="7"
      />

      <ThemedText type="subtitle" style={{ fontSize: 20 }}>
        Odometer baseline
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Used to calculate due mileage until you log your first oil change, and to track your current mileage in between changes.
      </ThemedText>
      <TextField
        label="Current odometer (optional)"
        value={currentOdometer}
        onChangeText={setCurrentOdometer}
        keyboardType="number-pad"
        placeholder="45000"
      />

      <ThemedText type="subtitle" style={{ fontSize: 20 }}>
        Manual override (optional)
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Overrides the calculated next-due mileage/date, e.g. if a mechanic set a custom due point.
      </ThemedText>
      <TextField
        label="Next due mileage override"
        value={manualNextDueMileage}
        onChangeText={setManualNextDueMileage}
        keyboardType="number-pad"
        placeholder="None"
      />
      <DateField label="Next due date override" value={manualNextDueDate || todayISODate()} onChange={setManualNextDueDate} />
      {manualNextDueDate ? (
        <PrimaryButton label="Clear date override" variant="secondary" onPress={() => setManualNextDueDate('')} />
      ) : null}

      <PrimaryButton label={submitting ? 'Saving…' : submitLabel} onPress={handleSubmit} disabled={!canSubmit || submitting} />
    </ThemedView>
  );
}
