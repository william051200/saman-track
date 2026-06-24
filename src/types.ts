export interface ParkingRecord {
  /** Stable client-generated id (used for edit/delete and sync reconciliation). */
  id: string;
  /** Parking day in ISO format YYYY-MM-DD. */
  date: string;
  /** Whether a fine was issued for not paying the parking fee that day. */
  fined: boolean;
  /** Fine time in HH:mm (24h). Empty when not fined. */
  fineTime: string;
  /** Record creation timestamp (ISO). */
  createdAt: string;
  /** Soft-delete marker (excluded from totals and the .txt file). */
  deleted?: boolean;
}

/** Money/business constants (currency: MYR / RM). */
export const PARKING_FEE = 9; // RM saved per parked day (fee avoided)
export const FINE = 10; // RM paid per fine

/** Default hourly parking rate (RM/hour). */
export const HOURLY_RATE_DEFAULT = 1.2;
/** Default peak-window length, in whole hours, the user would pay to cover. */
export const PEAK_WINDOW_HOURS_DEFAULT = 1;

/** User-configurable settings (currency: MYR / RM). */
export interface Settings {
  /** Parking cost per hour, in RM. */
  hourlyRate: number;
  /** Length of the peak enforcement window to pay for, in whole hours. */
  peakWindowHours: number;
}

export const DEFAULT_SETTINGS: Settings = {
  hourlyRate: HOURLY_RATE_DEFAULT,
  peakWindowHours: PEAK_WINDOW_HOURS_DEFAULT,
};

export interface Totals {
  /** Number of recorded parking days. */
  days: number;
  /** Number of days a fine was issued. */
  fines: number;
  /** RM9 x days (parking fees avoided, before fines). */
  totalSavedBeforeFines: number;
  /** RM10 x fines. */
  totalFined: number;
  /** Net = totalSavedBeforeFines - totalFined. */
  netSavings: number;
}
