import { ParkingRecord } from '../types';
import { AppConfig } from './storage';

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const HEADER = ['id', 'date', 'fined', 'fineTime', 'createdAt'];

let gisLoaded: Promise<void> | null = null;
let accessToken: string | null = null;
let tokenExpiry = 0;

/** Inject the Google Identity Services script once. */
function loadGis(): Promise<void> {
  if (gisLoaded) return gisLoaded;
  gisLoaded = new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const s = document.createElement('script');
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Google Identity Services.'));
    document.head.appendChild(s);
  });
  return gisLoaded;
}

export function isSignedIn(): boolean {
  return !!accessToken && Date.now() < tokenExpiry;
}

/** Obtain an OAuth access token via a Google sign-in popup. */
export async function signIn(clientId: string): Promise<void> {
  if (!clientId) throw new Error('Missing Google client ID. Set it in Settings.');
  await loadGis();
  await new Promise<void>((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (resp) => {
        if (resp.error) return reject(new Error(resp.error));
        accessToken = resp.access_token;
        tokenExpiry = Date.now() + (resp.expires_in - 60) * 1000;
        resolve();
      },
    });
    client.requestAccessToken({ prompt: '' });
  });
}

export function signOut(): void {
  accessToken = null;
  tokenExpiry = 0;
}

async function ensureToken(clientId: string): Promise<string> {
  if (isSignedIn()) return accessToken!;
  await signIn(clientId);
  return accessToken!;
}

async function sheetsFetch(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<any> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets API ${res.status}: ${body}`);
  }
  return res.status === 204 ? null : res.json();
}

function recordToRow(r: ParkingRecord): (string | boolean)[] {
  return [r.id, r.date, r.fined ? 'TRUE' : 'FALSE', r.fineTime, r.createdAt];
}

function rowToRecord(row: string[]): ParkingRecord | null {
  if (!row || !row[0]) return null;
  return {
    id: String(row[0]),
    date: String(row[1] ?? ''),
    fined: String(row[2]).toUpperCase() === 'TRUE',
    fineTime: String(row[3] ?? ''),
    createdAt: String(row[4] ?? ''),
  };
}

/** Read all active records currently stored in the sheet. */
export async function pullRemote(config: AppConfig): Promise<ParkingRecord[]> {
  const token = await ensureToken(config.googleClientId);
  const range = `${config.sheetName}!A2:E`;
  const data = await sheetsFetch(
    token,
    `${config.spreadsheetId}/values/${encodeURIComponent(range)}`,
  );
  const rows: string[][] = data?.values ?? [];
  return rows.map(rowToRecord).filter((r): r is ParkingRecord => r !== null);
}

/** Overwrite the sheet with the given active records (header + rows). */
export async function pushRemote(
  config: AppConfig,
  records: ParkingRecord[],
): Promise<void> {
  const token = await ensureToken(config.googleClientId);
  const sheet = config.sheetName;

  // Clear existing data, then write header + rows.
  await sheetsFetch(
    token,
    `${config.spreadsheetId}/values/${encodeURIComponent(`${sheet}!A:E`)}:clear`,
    { method: 'POST' },
  );

  const values = [HEADER, ...records.map(recordToRow)];
  await sheetsFetch(
    token,
    `${config.spreadsheetId}/values/${encodeURIComponent(`${sheet}!A1`)}?valueInputOption=RAW`,
    { method: 'PUT', body: JSON.stringify({ values }) },
  );
}
