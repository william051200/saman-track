import { ParkingRecord } from '../types';
import { activeRecords } from './calc';

export interface HourBucket {
  hour: number; // 0..23
  label: string; // "07:00"
  count: number;
}

/** Build a 24-bucket histogram of fine times. */
export function fineTimeHistogram(records: ParkingRecord[]): HourBucket[] {
  const buckets: HourBucket[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: `${String(h).padStart(2, '0')}:00`,
    count: 0,
  }));
  for (const r of activeRecords(records)) {
    if (!r.fined || !r.fineTime) continue;
    const hour = parseInt(r.fineTime.split(':')[0], 10);
    if (Number.isFinite(hour) && hour >= 0 && hour < 24) buckets[hour].count++;
  }
  return buckets;
}

/** Convert "HH:mm" into minutes since midnight. */
function toMinutes(time: string): number | null {
  const [h, m] = time.split(':').map((x) => parseInt(x, 10));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function minutesToLabel(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.round(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface FineTimeSummary {
  /** Average fine time as "HH:mm", or null if no fines. */
  average: string | null;
  /** Most common hour window, e.g. "08:00-09:00", or null. */
  peakWindow: string | null;
  /** Number of fines counted. */
  count: number;
}

export function fineTimeSummary(records: ParkingRecord[]): FineTimeSummary {
  const times = activeRecords(records)
    .filter((r) => r.fined && r.fineTime)
    .map((r) => toMinutes(r.fineTime))
    .filter((x): x is number => x !== null);

  if (times.length === 0) {
    return { average: null, peakWindow: null, count: 0 };
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;

  const hist = fineTimeHistogram(records);
  const peak = hist.reduce((best, b) => (b.count > best.count ? b : best), hist[0]);
  const peakWindow =
    peak.count > 0
      ? `${peak.label}-${String((peak.hour + 1) % 24).padStart(2, '0')}:00`
      : null;

  return { average: minutesToLabel(avg), peakWindow, count: times.length };
}

/** Busiest fine hour (0..23) with the most logged fines, or null when no data. */
export function peakFineHour(records: ParkingRecord[]): number | null {
  const hist = fineTimeHistogram(records);
  const peak = hist.reduce((best, b) => (b.count > best.count ? b : best), hist[0]);
  return peak.count > 0 ? peak.hour : null;
}
