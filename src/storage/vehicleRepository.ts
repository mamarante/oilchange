import { getDb } from '@/storage/db';
import { NewVehicle, Vehicle } from '@/types';
import { generateId } from '@/utils/id';
import { nowISOTimestamp } from '@/utils/date';

interface VehicleRow {
  id: string;
  year: number;
  make: string;
  model: string;
  engine_size: string | null;
  interval_miles: number | null;
  interval_months: number | null;
  reminder_threshold_miles: number;
  reminder_threshold_days: number;
  current_odometer: number | null;
  current_odometer_updated_at: string | null;
  baseline_odometer: number | null;
  manual_next_due_mileage: number | null;
  manual_next_due_date: string | null;
  created_at: string;
  updated_at: string;
}

function rowToVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    year: row.year,
    make: row.make,
    model: row.model,
    engineSize: row.engine_size,
    intervalMiles: row.interval_miles,
    intervalMonths: row.interval_months,
    reminderThresholdMiles: row.reminder_threshold_miles,
    reminderThresholdDays: row.reminder_threshold_days,
    currentOdometer: row.current_odometer,
    currentOdometerUpdatedAt: row.current_odometer_updated_at,
    baselineOdometer: row.baseline_odometer,
    manualNextDueMileage: row.manual_next_due_mileage,
    manualNextDueDate: row.manual_next_due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<VehicleRow>('SELECT * FROM vehicles ORDER BY created_at ASC');
  return rows.map(rowToVehicle);
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const database = await getDb();
  const row = await database.getFirstAsync<VehicleRow>('SELECT * FROM vehicles WHERE id = ?', id);
  return row ? rowToVehicle(row) : null;
}

export async function createVehicle(input: NewVehicle): Promise<Vehicle> {
  const id = generateId();
  const now = nowISOTimestamp();
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO vehicles (
      id, year, make, model, engine_size, interval_miles, interval_months,
      reminder_threshold_miles, reminder_threshold_days, current_odometer,
      current_odometer_updated_at, baseline_odometer, manual_next_due_mileage, manual_next_due_date,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.year,
    input.make,
    input.model,
    input.engineSize,
    input.intervalMiles,
    input.intervalMonths,
    input.reminderThresholdMiles,
    input.reminderThresholdDays,
    input.currentOdometer,
    input.currentOdometerUpdatedAt,
    // Seed the fixed mileage baseline from the vehicle's starting odometer reading.
    input.currentOdometer,
    input.manualNextDueMileage,
    input.manualNextDueDate,
    now,
    now,
  );
  return { ...input, id, baselineOdometer: input.currentOdometer, createdAt: now, updatedAt: now };
}

export async function updateVehicle(id: string, input: NewVehicle): Promise<void> {
  const now = nowISOTimestamp();
  const database = await getDb();
  await database.runAsync(
    `UPDATE vehicles SET
      year = ?, make = ?, model = ?, engine_size = ?, interval_miles = ?, interval_months = ?,
      reminder_threshold_miles = ?, reminder_threshold_days = ?, current_odometer = ?,
      current_odometer_updated_at = ?, baseline_odometer = COALESCE(baseline_odometer, ?),
      manual_next_due_mileage = ?, manual_next_due_date = ?, updated_at = ?
    WHERE id = ?`,
    input.year,
    input.make,
    input.model,
    input.engineSize,
    input.intervalMiles,
    input.intervalMonths,
    input.reminderThresholdMiles,
    input.reminderThresholdDays,
    input.currentOdometer,
    input.currentOdometerUpdatedAt,
    input.currentOdometer,
    input.manualNextDueMileage,
    input.manualNextDueDate,
    now,
    id,
  );
}

export async function updateVehicleOdometer(id: string, odometer: number, updatedAtDate: string): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    `UPDATE vehicles SET
      current_odometer = ?, current_odometer_updated_at = ?, baseline_odometer = COALESCE(baseline_odometer, ?), updated_at = ?
    WHERE id = ?`,
    odometer,
    updatedAtDate,
    odometer,
    nowISOTimestamp(),
    id,
  );
}

export async function deleteVehicle(id: string): Promise<void> {
  const database = await getDb();
  await database.runAsync('DELETE FROM vehicles WHERE id = ?', id);
}
