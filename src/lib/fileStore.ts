import { ParkingRecord } from '../types';
import { serializeRecords, parseRecords } from './txtFormat';

const DEFAULT_FILENAME = 'saman-track.txt';

/** Whether this browser supports linking a real file for auto-save. */
export function supportsFileLink(): boolean {
  return typeof (window as any).showOpenFilePicker === 'function';
}

let linkedHandle: any = null;

export function hasLinkedFile(): boolean {
  return linkedHandle !== null;
}

export function linkedFileName(): string | null {
  return linkedHandle?.name ?? null;
}

async function verifyPermission(handle: any): Promise<boolean> {
  const opts = { mode: 'readwrite' as const };
  if ((await handle.queryPermission(opts)) === 'granted') return true;
  if ((await handle.requestPermission(opts)) === 'granted') return true;
  return false;
}

/** Let the user pick or create a .txt file to link for auto-save. */
export async function linkFile(create: boolean): Promise<ParkingRecord[] | null> {
  const w = window as any;
  let handle: any;
  if (create) {
    handle = await w.showSaveFilePicker({
      suggestedName: DEFAULT_FILENAME,
      types: [{ description: 'Text file', accept: { 'text/plain': ['.txt'] } }],
    });
    linkedHandle = handle;
    return [];
  }
  [handle] = await w.showOpenFilePicker({
    types: [{ description: 'Text file', accept: { 'text/plain': ['.txt'] } }],
    multiple: false,
  });
  if (!(await verifyPermission(handle))) throw new Error('Permission to the file was denied.');
  linkedHandle = handle;
  const file = await handle.getFile();
  const text = await file.text();
  return parseRecords(text);
}

/** Write records to the linked file (no-op if nothing is linked). */
export async function writeLinkedFile(records: ParkingRecord[]): Promise<void> {
  if (!linkedHandle) return;
  if (!(await verifyPermission(linkedHandle))) throw new Error('Permission to the file was denied.');
  const writable = await linkedHandle.createWritable();
  await writable.write(serializeRecords(records));
  await writable.close();
}

/** Download records as a .txt file (works on every platform). */
export function exportTxt(records: ParkingRecord[]): void {
  const blob = new Blob([serializeRecords(records)], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = DEFAULT_FILENAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Prompt the user to choose a .txt file and return its parsed records. */
export function importTxt(): Promise<ParkingRecord[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,text/plain';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return reject(new Error('No file selected.'));
      try {
        resolve(parseRecords(await file.text()));
      } catch (e) {
        reject(e as Error);
      }
    };
    input.click();
  });
}
