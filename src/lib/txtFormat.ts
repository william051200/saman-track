import { ParkingRecord } from '../types';

/**
 * Pipe-separated (|) plain-text format.
 *   Header: id|date|fined|fineTime|createdAt
 *   One record per line.
 * Pipe characters in values are escaped as \| (none of the fields normally contain |).
 */

const HEADER = ['id', 'date', 'fined', 'fineTime', 'createdAt'] as const;
const SEP = '|';

function escape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
}

function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '\\' && i + 1 < line.length) {
      cur += line[i + 1];
      i++;
    } else if (ch === SEP) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

/** Serialize active (non-deleted) records to a .txt document. */
export function serializeRecords(records: ParkingRecord[]): string {
  const lines = [HEADER.join(SEP)];
  for (const r of records) {
    if (r.deleted) continue;
    lines.push(
      [
        r.id,
        r.date,
        r.fined ? 'TRUE' : 'FALSE',
        r.fineTime ?? '',
        r.createdAt,
      ]
        .map((v) => escape(String(v)))
        .join(SEP),
    );
  }
  return lines.join('\n') + '\n';
}

/** Parse a .txt document back into records. Tolerates an optional header line. */
export function parseRecords(text: string): ParkingRecord[] {
  const rawLines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (rawLines.length === 0) return [];

  let start = 0;
  const firstCols = splitLine(rawLines[0]).map((c) => c.trim().toLowerCase());
  if (firstCols[0] === 'id' && firstCols.includes('date')) start = 1; // skip header

  const records: ParkingRecord[] = [];
  for (let i = start; i < rawLines.length; i++) {
    const cols = splitLine(rawLines[i]);
    if (!cols[0]) continue;
    records.push({
      id: cols[0],
      date: cols[1] ?? '',
      fined: String(cols[2]).toUpperCase() === 'TRUE',
      fineTime: cols[3] ?? '',
      createdAt: cols[4] ?? new Date().toISOString(),
    });
  }
  return records;
}
