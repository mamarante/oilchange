import { useMemo } from 'react';

import { useAppData } from '@/context/AppDataContext';
import { DueStatus, OilChangeLog, Vehicle } from '@/types';
import { computeDueStatus, mostRecentLog } from '@/utils/dueStatus';

export interface VehicleWithStatus {
  vehicle: Vehicle;
  logs: OilChangeLog[];
  lastLog: OilChangeLog | null;
  status: DueStatus;
}

export function useVehiclesWithStatus(): VehicleWithStatus[] {
  const { vehicles, logsByVehicle } = useAppData();

  return useMemo(
    () =>
      vehicles.map((vehicle) => {
        const logs = logsByVehicle[vehicle.id] ?? [];
        const lastLog = mostRecentLog(logs);
        return { vehicle, logs, lastLog, status: computeDueStatus(vehicle, lastLog) };
      }),
    [vehicles, logsByVehicle],
  );
}

export function useVehicleWithStatus(vehicleId: string | undefined): VehicleWithStatus | null {
  const all = useVehiclesWithStatus();
  return useMemo(() => all.find((v) => v.vehicle.id === vehicleId) ?? null, [all, vehicleId]);
}
