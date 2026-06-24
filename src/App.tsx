import { useEffect, useMemo, useState } from 'react';
import { ParkingRecord, Settings as AppSettings } from './types';
import { loadRecords, saveRecords } from './lib/storage';
import { loadSettings, saveSettings } from './lib/settings';
import { hasLinkedFile, writeLinkedFile } from './lib/fileStore';
import { activeRecords } from './lib/calc';
import Dashboard from './components/Dashboard';
import AddRecord from './components/AddRecord';
import History from './components/History';
import Settings from './components/Settings';

type Tab = 'dashboard' | 'add' | 'history' | 'settings';

export default function App() {
  const [records, setRecords] = useState<ParkingRecord[]>(() => loadRecords());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [tab, setTab] = useState<Tab>('dashboard');
  const [status, setStatus] = useState<string>('');

  // Persist to localStorage on every change, and mirror to the linked .txt file.
  useEffect(() => {
    saveRecords(records);
    if (hasLinkedFile()) {
      writeLinkedFile(activeRecords(records)).catch((e) =>
        setStatus(`File save failed: ${(e as Error).message}`),
      );
    }
  }, [records]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const dayCount = useMemo(() => activeRecords(records).length, [records]);

  function upsertRecord(rec: ParkingRecord) {
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === rec.id);
      if (idx === -1) return [...prev, rec];
      const copy = [...prev];
      copy[idx] = rec;
      return copy;
    });
  }

  function deleteRecord(id: string) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>saman-track</h1>
        <span className="count-pill">{dayCount} days</span>
      </header>

      {status && (
        <div className="status-bar" onClick={() => setStatus('')}>
          {status}
        </div>
      )}

      <main className="content">
        {tab === 'dashboard' && <Dashboard records={records} settings={settings} />}
        {tab === 'add' && (
          <AddRecord
            onSave={(rec) => {
              upsertRecord(rec);
              setStatus('Saved.');
              setTab('history');
            }}
          />
        )}
        {tab === 'history' && (
          <History records={records} onEdit={upsertRecord} onDelete={deleteRecord} />
        )}
        {tab === 'settings' && (
          <Settings
            records={records}
            settings={settings}
            onSettingsChange={setSettings}
            onReplaceAll={(recs) => {
              setRecords(recs);
              setStatus(`Loaded ${recs.length} record${recs.length === 1 ? '' : 's'}.`);
            }}
            onStatus={setStatus}
          />
        )}
      </main>

      <nav className="tabbar">
        <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>
          📊<span>Stats</span>
        </button>
        <button className={tab === 'add' ? 'active' : ''} onClick={() => setTab('add')}>
          ➕<span>Add</span>
        </button>
        <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
          📜<span>History</span>
        </button>
        <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
          ⚙️<span>Data</span>
        </button>
      </nav>
    </div>
  );
}
