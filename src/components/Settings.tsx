import { useState } from 'react';
import { ParkingRecord, Settings as AppSettings } from '../types';
import { activeRecords } from '../lib/calc';
import {
  exportTxt,
  importTxt,
  linkFile,
  linkedFileName,
  supportsFileLink,
} from '../lib/fileStore';

interface Props {
  records: ParkingRecord[];
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onReplaceAll: (records: ParkingRecord[]) => void;
  onStatus: (msg: string) => void;
}

export default function Settings({
  records,
  settings,
  onSettingsChange,
  onReplaceAll,
  onStatus,
}: Props) {
  const [linked, setLinked] = useState<string | null>(linkedFileName());
  const canLink = supportsFileLink();
  const active = activeRecords(records);

  async function handleImport() {
    try {
      const recs = await importTxt();
      onReplaceAll(recs);
    } catch (e) {
      onStatus(`Import failed: ${(e as Error).message}`);
    }
  }

  async function handleLink(create: boolean) {
    try {
      const recs = await linkFile(create);
      setLinked(linkedFileName());
      if (create) {
        onStatus(`Linked “${linkedFileName()}”. Changes now auto-save to it.`);
      } else if (recs) {
        onReplaceAll(recs);
        onStatus(`Linked “${linkedFileName()}”. Loaded ${recs.length} record(s).`);
      }
    } catch (e) {
      const msg = (e as Error).message || '';
      if (!/abort/i.test(msg)) onStatus(`Link failed: ${msg}`);
    }
  }

  return (
    <div className="card form">
      <h2>Parking-cost settings</h2>
      <p className="muted">
        Used by the dashboard to estimate how much you save by paying only during the peak
        enforcement window.
      </p>

      <label>
        Parking rate (RM / hour)
        <input
          type="number"
          min="0"
          step="0.1"
          value={settings.hourlyRate}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              hourlyRate: Math.max(0, Number(e.target.value) || 0),
            })
          }
        />
      </label>

      <label>
        Peak window to pay for (hours)
        <input
          type="number"
          min="1"
          step="1"
          value={settings.peakWindowHours}
          onChange={(e) =>
            onSettingsChange({
              ...settings,
              peakWindowHours: Math.max(1, Math.round(Number(e.target.value) || 1)),
            })
          }
        />
      </label>

      <hr className="sep" />

      <h2>Data (local .txt file)</h2>
      <p className="muted">
        Records are stored on this device. The file is plain text, one record per line,
        fields separated by <code>|</code>.
      </p>

      <div className="data-actions">
        <button className="primary" onClick={() => exportTxt(active)}>
          ⬇️ Export .txt
        </button>
        <button className="secondary" onClick={handleImport}>
          ⬆️ Import .txt
        </button>
      </div>

      <hr className="sep" />

      {canLink ? (
        <>
          <h3>Linked file (auto-save)</h3>
          <p className="muted">
            {linked ? (
              <>
                Linked to <strong>{linked}</strong> — every change saves automatically.
              </>
            ) : (
              'Link a .txt file once and the app will auto-save to it.'
            )}
          </p>
          <div className="data-actions">
            <button className="secondary" onClick={() => handleLink(false)}>
              🔗 Link existing file
            </button>
            <button className="secondary" onClick={() => handleLink(true)}>
              ✨ Create new file
            </button>
          </div>
        </>
      ) : (
        <p className="muted">
          This browser can’t auto-save to a file (common on iOS/Android). Use{' '}
          <strong>Export</strong> to save a backup and <strong>Import</strong> to restore.
        </p>
      )}

      <hr className="sep" />
      <p className="muted">{active.length} record(s) currently stored.</p>
    </div>
  );
}
