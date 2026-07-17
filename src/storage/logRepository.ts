import { getDb } from '@/storage/db';
import { NewOilChangeLog, OilChangeLog, OilType } from '@/types';
import { generateId } from '@/utils/id';
import { nowISOTimestamp } from '@/utils/date';

interface LogRow {
  id: string;
  vehicle_id: string;
  date: string;
  mileage: number;
  oil_brand: string | null;
  oil_type: OilType;
  filter_brand: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function rowToLog(row: LogRow): OilChangeLog {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    date: row.date,
    mileage: row.mileage,
    oilBrand: row.oil_brand,
    oilType: row.oil_type,
    filterBrand: row.filter_brand,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getLogsForVehicle(vehicleId: string): Promise<OilChangeLog[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<LogRow>(
    'SELECT * FROM oil_change_logs WHERE vehicle_id = ? ORDER BY date DESC, mileage DESC',
    vehicleId,
  );
  return rows.map(rowToLog);
}

export async function getLog(id: string): Promise<OilChangeLog | null> {
  const database = await getDb();
  const row = await database.getFirstAsync<LogRow>('SELECT * FROM oil_change_logs WHERE id = ?', id);
  return row ? rowToLog(row) : null;
}

export async function createLog(input: NewOilChangeLog): Promise<OilChangeLog> {
  const id = generateId();
  const now = nowISOTimestamp();
  const database = await getDb();
  await database.runAsync(
    `INSERT INTO oil_change_logs (
      id, vehicle_id, date, mileage, oil_brand, oil_type, filter_brand, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.vehicleId,
    input.date,
    input.mileage,
    input.oilBrand,
    input.oilType,
    input.filterBrand,
    input.notes,
    now,
    now,
  );
  return { ...input, id, createdAt: now, updatedAt: now };
}

export async function updateLog(id: string, input: NewOilChangeLog): Promise<void> {
  const now = nowISOTimestamp();
  const database = await getDb();
  await database.runAsync(
    `UPDATE oil_change_logs SET
      date = ?, mileage = ?, oil_brand = ?, oil_type = ?, filter_brand = ?, notes = ?, updated_at = ?
    WHERE id = ?`,
    input.date,
    input.mileage,
    input.oilBrand,
    input.oilType,
    input.filterBrand,
    input.notes,
    now,
    id,
  );
}

export async function deleteLog(id: string): Promise<void> {
  const database = await getDb();
  await database.runAsync('DELETE FROM oil_change_logs WHERE id = ?', id);
}
