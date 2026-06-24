import { ParkingRecord } from '../types';

const RECORDS_KEY = 'saman-track:records';

export function loadRecords(): ParkingRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ParkingRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: ParkingRecord[]): void {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
