import { ParkingRecord, Totals, PARKING_FEE, FINE } from '../types';

/** Active (non-deleted) records only. */
export function activeRecords(records: ParkingRecord[]): ParkingRecord[] {
  return records.filter((r) => !r.deleted);
}

/** Compute the three headline numbers plus counts. */
export function computeTotals(records: ParkingRecord[]): Totals {
  const active = activeRecords(records);
  const days = active.length;
  const fines = active.filter((r) => r.fined).length;
  const totalSavedBeforeFines = days * PARKING_FEE;
  const totalFined = fines * FINE;
  return {
    days,
    fines,
    totalSavedBeforeFines,
    totalFined,
    netSavings: totalSavedBeforeFines - totalFined,
  };
}

/** Format a number as Malaysian Ringgit, e.g. RM123. */
export function formatRM(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return `${sign}RM${Math.abs(amount).toLocaleString('en-MY')}`;
}
