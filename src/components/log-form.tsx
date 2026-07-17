import { useState } from 'react';

import { DateField } from '@/components/form/date-field';
import { SegmentedControl } from '@/components/form/segmented-control';
import { TextField } from '@/components/form/text-field';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { NewOilChangeLog, OIL_TYPE_LABELS, OilChangeLog, OilType } from '@/types';
import { todayISODate } from '@/utils/date';

const OIL_TYPE_OPTIONS = (Object.entries(OIL_TYPE_LABELS) as [OilType, string][]).map(([value, label]) => ({ value, label }));

interface LogFormProps {
  vehicleId: string;
  initial?: OilChangeLog;
  suggestedMileage?: number;
  onSubmit: (input: NewOilChangeLog) => Promise<void>;
  submitLabel: string;
}

export function LogForm({ vehicleId, initial, suggestedMileage, onSubmit, submitLabel }: LogFormProps) {
  const [date, setDate] = useState(initial?.date ?? todayISODate());
  const [mileage, setMileage] = useState(initial ? String(initial.mileage) : suggestedMileage != null ? String(suggestedMileage) : '');
  const [oilBrand, setOilBrand] = useState(initial?.oilBrand ?? '');
  const [oilType, setOilType] = useState<OilType>(initial?.oilType ?? 'full_synthetic');
  const [filterBrand, setFilterBrand] = useState(initial?.filterBrand ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);

  const mileageNumber = Number(mileage);
  const canSubmit = date.trim() !== '' && mileage.trim() !== '' && Number.isFinite(mileageNumber) && mileageNumber >= 0;

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        vehicleId,
        date,
        mileage: mileageNumber,
        oilBrand: oilBrand.trim() || null,
        oilType,
        filterBrand: filterBrand.trim() || null,
        notes: notes.trim() || null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={{ gap: Spacing.three }}>
      <DateField label="Date of oil change" value={date} onChange={setDate} />
      <TextField label="Mileage" value={mileage} onChangeText={setMileage} keyboardType="number-pad" placeholder="45000" />
      <SegmentedControl label="Oil type" options={OIL_TYPE_OPTIONS} value={oilType} onChange={setOilType} />
      <TextField label="Oil brand/product (optional)" value={oilBrand} onChangeText={setOilBrand} placeholder="Mobil 1" />
      <TextField label="Filter brand (optional)" value={filterBrand} onChangeText={setFilterBrand} placeholder="Fram" />
      <TextField
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Any notes about this service"
        multiline
        numberOfLines={3}
      />
      <PrimaryButton label={submitting ? 'Saving…' : submitLabel} onPress={handleSubmit} disabled={!canSubmit || submitting} />
    </ThemedView>
  );
}
