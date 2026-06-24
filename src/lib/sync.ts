import { ParkingRecord } from '../types';
import { AppConfig } from './storage';
import { pullRemote, pushRemote } from './google';

export interface SyncResult {
  records: ParkingRecord[];
  pushed: boolean;
  pulled: boolean;
}

/**
 * Two-way sync with a last-write-wins bias toward local changes.
 * - If there are local pending changes (dirty/deleted), local wins and is pushed.
 * - Otherwise remote is pulled and replaces the local cache.
 */
export async function syncWithSheet(
  config: AppConfig,
  local: ParkingRecord[],
): Promise<SyncResult> {
  if (!config.googleClientId || !config.spreadsheetId) {
    throw new Error('Connect Google Sheets in Settings first.');
  }

  const hasLocalChanges = local.some((r) => r.dirty || r.deleted);

  if (hasLocalChanges) {
    const active = local.filter((r) => !r.deleted);
    await pushRemote(config, active);
    const cleaned = active.map((r) => ({ ...r, dirty: false }));
    return { records: cleaned, pushed: true, pulled: false };
  }

  const remote = await pullRemote(config);
  return { records: remote, pushed: false, pulled: true };
}
