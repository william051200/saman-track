import { ParkingRecord } from '../types';

const RECORDS_KEY = 'saman-track:records';

/** A small persisted settings bag stored separately from records. */
export interface AppConfig {
  googleClientId: string;
  spreadsheetId: string;
  /** Sheet/tab name inside the spreadsheet. */
  sheetName: string;
}

const CONFIG_KEY = 'saman-track:config';

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

export function loadConfig(): AppConfig {
  const defaults: AppConfig = {
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
    spreadsheetId: import.meta.env.VITE_SPREADSHEET_ID ?? '',
    sheetName: 'Records',
  };
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...(JSON.parse(raw) as Partial<AppConfig>) };
  } catch {
    return defaults;
  }
}

export function saveConfig(config: AppConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
