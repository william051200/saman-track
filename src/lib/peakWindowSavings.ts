import { ParkingRecord, Settings, FINE } from '../types';
import { activeRecords } from './calc';
import { fineTimeHistogram } from './timeAnalysis';

export interface PeakWindowSavings {
  /** Whether there is enough data (at least one fine) to compute. */
  hasData: boolean;
  /** Parked days tracked. */
  days: number;
  /** Total fines. */
  fines: number;
  /** Peak-window length used, in hours (clamped to the enforcement span). */
  windowHours: number;
  /** Peak window label, e.g. "08:00-10:00", or null. */
  windowLabel: string | null;
  /** Fines that fall inside the peak window. */
  finesInWindow: number;
  /** Fines that fall outside the peak window (still risk a fine). */
  finesOutWindow: number;
  /** Full enforcement span, in hours (earliest..latest observed fine hour). */
  spanHours: number;
  /** Span label, e.g. "08:00-17:00", or null. */
  spanLabel: string | null;

  /** Scenario cost: never pay, get fined sometimes. */
  costNeverPay: number;
  /** Scenario cost: pay the peak window every day, still fined outside it. */
  costPeakWindow: number;
  /** Scenario cost: pay the full enforcement span every day (never fined). */
  costFullCoverage: number;

  /** Smart-strategy savings vs never paying (positive = saves money). */
  savingsVsNeverPay: number;
  /** Smart-strategy savings vs paying full coverage (positive = saves money). */
  savingsVsFullCoverage: number;
}

function hourLabel(hour: number): string {
  return `${String(hour % 24).padStart(2, '0')}:00`;
}

/**
 * Compute the side-by-side cost of three parking strategies and how much more
 * the "pay only during the peak window" strategy saves.
 *
 * Model (per tracked period):
 *   - never pay:        fines x RM10
 *   - peak window:      days x windowHours x rate + finesOutWindow x RM10
 *   - full coverage:    days x spanHours x rate          (never fined)
 */
export function peakWindowSavings(
  records: ParkingRecord[],
  settings: Settings,
): PeakWindowSavings {
  const active = activeRecords(records);
  const days = active.length;
  const rate = settings.hourlyRate;

  const hist = fineTimeHistogram(records);
  const fines = hist.reduce((sum, b) => sum + b.count, 0);

  const empty: PeakWindowSavings = {
    hasData: false,
    days,
    fines: 0,
    windowHours: 0,
    windowLabel: null,
    finesInWindow: 0,
    finesOutWindow: 0,
    spanHours: 0,
    spanLabel: null,
    costNeverPay: 0,
    costPeakWindow: 0,
    costFullCoverage: 0,
    savingsVsNeverPay: 0,
    savingsVsFullCoverage: 0,
  };

  if (fines === 0 || days === 0) return empty;

  // Enforcement span: earliest..latest hour that has at least one fine.
  const firstHour = hist.findIndex((b) => b.count > 0);
  let lastHour = firstHour;
  for (let h = hist.length - 1; h >= 0; h--) {
    if (hist[h].count > 0) {
      lastHour = h;
      break;
    }
  }
  const spanHours = lastHour - firstHour + 1;
  const spanLabel = `${hourLabel(firstHour)}-${hourLabel(lastHour + 1)}`;

  // Clamp the requested window length to [1, spanHours].
  const windowHours = Math.max(1, Math.min(Math.round(settings.peakWindowHours), spanHours));

  // Find the W-consecutive-hour window capturing the most fines.
  let bestStart = firstHour;
  let bestCount = -1;
  for (let start = firstHour; start + windowHours - 1 <= lastHour; start++) {
    let count = 0;
    for (let h = start; h < start + windowHours; h++) count += hist[h].count;
    if (count > bestCount) {
      bestCount = count;
      bestStart = start;
    }
  }
  const finesInWindow = bestCount;
  const finesOutWindow = fines - finesInWindow;
  const windowLabel = `${hourLabel(bestStart)}-${hourLabel(bestStart + windowHours)}`;

  const costNeverPay = fines * FINE;
  const costPeakWindow = days * windowHours * rate + finesOutWindow * FINE;
  const costFullCoverage = days * spanHours * rate;

  return {
    hasData: true,
    days,
    fines,
    windowHours,
    windowLabel,
    finesInWindow,
    finesOutWindow,
    spanHours,
    spanLabel,
    costNeverPay,
    costPeakWindow,
    costFullCoverage,
    savingsVsNeverPay: costNeverPay - costPeakWindow,
    savingsVsFullCoverage: costFullCoverage - costPeakWindow,
  };
}
