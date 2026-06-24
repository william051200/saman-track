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

/** Default parking rate per 30 minutes (RM). */
export const RATE_PER_30MIN_DEFAULT = 0.6;
/** Default pay-window start time (HH:mm). */
export const PAY_START_DEFAULT = '08:00';
/** Default pay-window end time (HH:mm). */
export const PAY_END_DEFAULT = '09:00';

/** User-configurable settings (currency: MYR / RM). */
export interface Settings {
  /** Parking cost per 30 minutes, in RM. */
  ratePer30Min: number;
  /** Pay-window start time, "HH:mm" (24h, 30-min steps). */
  payStart: string;
  /** Pay-window end time, "HH:mm" (24h, 30-min steps). */
  payEnd: string;
}

export const DEFAULT_SETTINGS: Settings = {
  ratePer30Min: RATE_PER_30MIN_DEFAULT,
  payStart: PAY_START_DEFAULT,
  payEnd: PAY_END_DEFAULT,
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
