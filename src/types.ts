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
  /** True when the record still needs to be pushed to Google Sheets. */
  dirty?: boolean;
  /** True when the record was deleted locally and the deletion must be synced. */
  deleted?: boolean;
}

/** Money/business constants (currency: MYR / RM). */
export const PARKING_FEE = 9; // RM saved per parked day (fee avoided)
export const FINE = 10; // RM paid per fine

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
