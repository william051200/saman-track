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
  /** Pay-window length, in 30-minute blocks. */
  windowBlocks: number;
  /** Pay window label, e.g. "08:00-09:30", or null. */
  windowLabel: string | null;
  /** Fines that fall inside the pay window. */
  finesInWindow: number;
  /** Fines that fall outside the pay window (still risk a fine). */
  finesOutWindow: number;
  /** Full enforcement span, in 30-minute blocks (earliest..latest observed fine hour). */
  spanBlocks: number;
  /** Span label, e.g. "08:00-17:00", or null. */
  spanLabel: string | null;

  /** Scenario cost: never pay, get fined sometimes. */
  costNeverPay: number;
  /** Scenario cost: pay the pay window every day, still fined outside it. */
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

/** Parse "HH:mm" into minutes since midnight, or null when invalid. */
function toMinutes(time: string): number | null {
  const [h, m] = time.split(':').map((x) => parseInt(x, 10));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

/**
 * Compute the side-by-side cost of three parking strategies and how much more
 * the "pay only during the chosen window" strategy saves.
 *
 * All parking costs are billed in 30-minute blocks at `ratePer30Min`.
 *
 * Model (per tracked period):
 *   - never pay:        fines x RM10
 *   - pay window:       days x windowBlocks x ratePer30Min + finesOutWindow x RM10
 *   - full coverage:    days x spanBlocks x ratePer30Min          (never fined)
 */
export function peakWindowSavings(
  records: ParkingRecord[],
  settings: Settings,
): PeakWindowSavings {
  const active = activeRecords(records);
  const days = active.length;
  const rate = settings.ratePer30Min;

  const hist = fineTimeHistogram(records);
  const fines = hist.reduce((sum, b) => sum + b.count, 0);

  const empty: PeakWindowSavings = {
    hasData: false,
    days,
    fines: 0,
    windowBlocks: 0,
    windowLabel: null,
    finesInWindow: 0,
    finesOutWindow: 0,
    spanBlocks: 0,
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
  const spanBlocks = spanHours * 2;
  const spanLabel = `${hourLabel(firstHour)}-${hourLabel(lastHour + 1)}`;

  // User-specified pay window [payStart, payEnd), counted in 30-minute blocks.
  const startMin = toMinutes(settings.payStart);
  const endMin = toMinutes(settings.payEnd);
  const validWindow = startMin !== null && endMin !== null && endMin > startMin;
  const windowMinutes = validWindow ? endMin! - startMin! : 0;
  const windowBlocks = Math.ceil(windowMinutes / 30);
  const windowLabel = validWindow ? `${settings.payStart}-${settings.payEnd}` : null;

  // Count fines whose actual time falls within the chosen window.
  let finesInWindow = 0;
  if (validWindow) {
    for (const r of active) {
      if (!r.fined || !r.fineTime) continue;
      const t = toMinutes(r.fineTime);
      if (t !== null && t >= startMin! && t < endMin!) finesInWindow++;
    }
  }
  const finesOutWindow = fines - finesInWindow;

  const costNeverPay = fines * FINE;
  const costPeakWindow = days * windowBlocks * rate + finesOutWindow * FINE;
  const costFullCoverage = days * spanBlocks * rate;

  return {
    hasData: true,
    days,
    fines,
    windowBlocks,
    windowLabel,
    finesInWindow,
    finesOutWindow,
    spanBlocks,
    spanLabel,
    costNeverPay,
    costPeakWindow,
    costFullCoverage,
    savingsVsNeverPay: costNeverPay - costPeakWindow,
    savingsVsFullCoverage: costFullCoverage - costPeakWindow,
  };
}
