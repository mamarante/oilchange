import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

const DATABASE_NAME = 'oilchange.db';

let dbPromise: Promise<SQLiteDatabase> | null = null;

/** Async (not Sync) so the web platform, which bridges to a worker, doesn't block the JS thread. */
export function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync(DATABASE_NAME);
  }
  return dbPromise;
}

/** Creates tables on first run. Safe to call repeatedly. */
export async function initDb(): Promise<void> {
  const database = await getDb();
  await database.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY NOT NULL,
      year INTEGER NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      engine_size TEXT,
      interval_miles INTEGER,
      interval_months INTEGER,
      reminder_threshold_miles INTEGER NOT NULL DEFAULT 300,
      reminder_threshold_days INTEGER NOT NULL DEFAULT 7,
      current_odometer INTEGER,
      current_odometer_updated_at TEXT,
      baseline_odometer INTEGER,
      manual_next_due_mileage INTEGER,
      manual_next_due_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS oil_change_logs (
      id TEXT PRIMARY KEY NOT NULL,
      vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      mileage INTEGER NOT NULL,
      oil_brand TEXT,
      oil_type TEXT NOT NULL,
      filter_brand TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_oil_change_logs_vehicle_id ON oil_change_logs(vehicle_id);
  `);
}
