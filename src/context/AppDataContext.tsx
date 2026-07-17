import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { initDb } from '@/storage/db';
import * as logRepo from '@/storage/logRepository';
import * as vehicleRepo from '@/storage/vehicleRepository';
import { NewOilChangeLog, NewVehicle, OilChangeLog, Vehicle } from '@/types';
import { computeDueStatus, mostRecentLog } from '@/utils/dueStatus';
import { cancelRemindersForVehicle, notifyIfMileageDueNow, syncRemindersForVehicle } from '@/notifications/notifications';

interface AppDataContextValue {
  vehicles: Vehicle[];
  logsByVehicle: Record<string, OilChangeLog[]>;
  loading: boolean;
  addVehicle: (input: NewVehicle) => Promise<Vehicle>;
  editVehicle: (id: string, input: NewVehicle) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  updateOdometer: (id: string, odometer: number, date: string) => Promise<void>;
  addLog: (input: NewOilChangeLog) => Promise<OilChangeLog>;
  editLog: (id: string, vehicleId: string, input: NewOilChangeLog) => Promise<void>;
  removeLog: (id: string, vehicleId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: PropsWithChildren) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [logsByVehicle, setLogsByVehicle] = useState<Record<string, OilChangeLog[]>>({});
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const loadedVehicles = await vehicleRepo.getAllVehicles();
    const logsEntries = await Promise.all(
      loadedVehicles.map(async (v) => [v.id, await logRepo.getLogsForVehicle(v.id)] as const),
    );
    setVehicles(loadedVehicles);
    setLogsByVehicle(Object.fromEntries(logsEntries));
    return { loadedVehicles, logsEntries };
  }, []);

  useEffect(() => {
    (async () => {
      await initDb();
      await loadAll();
      setLoading(false);
    })();
  }, [loadAll]);

  const refresh = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  const resyncReminders = useCallback(async (vehicleId: string) => {
    const vehicle = await vehicleRepo.getVehicle(vehicleId);
    if (!vehicle) return;
    const logs = await logRepo.getLogsForVehicle(vehicleId);
    const status = computeDueStatus(vehicle, mostRecentLog(logs));
    await syncRemindersForVehicle(vehicle, status);
  }, []);

  const addVehicle = useCallback(
    async (input: NewVehicle) => {
      const vehicle = await vehicleRepo.createVehicle(input);
      await loadAll();
      await resyncReminders(vehicle.id);
      return vehicle;
    },
    [loadAll, resyncReminders],
  );

  const editVehicle = useCallback(
    async (id: string, input: NewVehicle) => {
      await vehicleRepo.updateVehicle(id, input);
      await loadAll();
      await resyncReminders(id);
    },
    [loadAll, resyncReminders],
  );

  const removeVehicle = useCallback(
    async (id: string) => {
      await cancelRemindersForVehicle(id);
      await vehicleRepo.deleteVehicle(id);
      await loadAll();
    },
    [loadAll],
  );

  const updateOdometer = useCallback(
    async (id: string, odometer: number, date: string) => {
      await vehicleRepo.updateVehicleOdometer(id, odometer, date);
      await loadAll();
      await resyncReminders(id);
      const vehicle = await vehicleRepo.getVehicle(id);
      const logs = vehicle ? await logRepo.getLogsForVehicle(id) : [];
      if (vehicle) await notifyIfMileageDueNow(vehicle, computeDueStatus(vehicle, mostRecentLog(logs)));
    },
    [loadAll, resyncReminders],
  );

  const addLog = useCallback(
    async (input: NewOilChangeLog) => {
      const log = await logRepo.createLog(input);
      await loadAll();
      await resyncReminders(input.vehicleId);
      return log;
    },
    [loadAll, resyncReminders],
  );

  const editLog = useCallback(
    async (id: string, vehicleId: string, input: NewOilChangeLog) => {
      await logRepo.updateLog(id, input);
      await loadAll();
      await resyncReminders(vehicleId);
    },
    [loadAll, resyncReminders],
  );

  const removeLog = useCallback(
    async (id: string, vehicleId: string) => {
      await logRepo.deleteLog(id);
      await loadAll();
      await resyncReminders(vehicleId);
    },
    [loadAll, resyncReminders],
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      vehicles,
      logsByVehicle,
      loading,
      addVehicle,
      editVehicle,
      removeVehicle,
      updateOdometer,
      addLog,
      editLog,
      removeLog,
      refresh,
    }),
    [vehicles, logsByVehicle, loading, addVehicle, editVehicle, removeVehicle, updateOdometer, addLog, editLog, removeLog, refresh],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider');
  return ctx;
}
