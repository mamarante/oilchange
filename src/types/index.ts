export type OilType = 'conventional' | 'synthetic_blend' | 'full_synthetic';

export const OIL_TYPE_LABELS: Record<OilType, string> = {
  conventional: 'Conventional',
  synthetic_blend: 'Synthetic Blend',
  full_synthetic: 'Full Synthetic',
};

export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  engineSize: string | null;
  /** Mileage-based interval, e.g. 5000 for "every 5,000 miles". Null disables mileage-based due tracking. */
  intervalMiles: number | null;
  /** Time-based interval in months, e.g. 6 for "every 6 months". Null disables time-based due tracking. */
  intervalMonths: number | null;
  /** Remind this many miles before the mileage-based due point. */
  reminderThresholdMiles: number;
  /** Remind this many days before the date-based due point. */
  reminderThresholdDays: number;
  /** Live odometer reading, kept current via the "Update Odometer" flow. Used to compute miles remaining. */
  currentOdometer: number | null;
  /** ISO date (YYYY-MM-DD) the odometer reading was last updated. */
  currentOdometerUpdatedAt: string | null;
  /**
   * Odometer reading the mileage interval counts from until the first oil change is logged.
   * Set once (seeded from the first odometer reading ever recorded) and never moves afterward —
   * unlike `currentOdometer`, which updates every time the user checks in their mileage.
   */
  baselineOdometer: number | null;
  /** Manual override for next-due mileage; takes precedence over the calculated value. */
  manualNextDueMileage: number | null;
  /** Manual override for next-due date (YYYY-MM-DD); takes precedence over the calculated value. */
  manualNextDueDate: string | null;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp */
  updatedAt: string;
}

/** `baselineOdometer` is repository-managed (seeded once, never resubmitted by forms) — not part of user input. */
export type NewVehicle = Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'baselineOdometer'>;

export interface OilChangeLog {
  id: string;
  vehicleId: string;
  /** ISO date (YYYY-MM-DD) the oil change was performed. */
  date: string;
  mileage: number;
  oilBrand: string | null;
  oilType: OilType;
  filterBrand: string | null;
  notes: string | null;
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp */
  updatedAt: string;
}

export type NewOilChangeLog = Omit<OilChangeLog, 'id' | 'createdAt' | 'updatedAt'>;

export type DueLevel = 'unknown' | 'ok' | 'due_soon' | 'overdue';

export interface DueStatus {
  /** Calculated (or manually overridden) next-due mileage, if trackable. */
  nextDueMileage: number | null;
  /** Calculated (or manually overridden) next-due date (YYYY-MM-DD), if trackable. */
  nextDueDate: string | null;
  /** Positive = miles left before due, negative = miles overdue. Null if not trackable. */
  milesRemaining: number | null;
  /** Positive = days left before due, negative = days overdue. Null if not trackable. */
  daysRemaining: number | null;
  /** Worst status across mileage and date tracks, using whichever-comes-first logic. */
  level: DueLevel;
  /** Which track(s) currently drive `level`. */
  reason: 'mileage' | 'date' | 'both' | null;
}
