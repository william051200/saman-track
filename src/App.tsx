import { useEffect, useMemo, useState } from 'react';
import { ParkingRecord } from './types';
import {
  AppConfig,
  loadConfig,
  loadRecords,
  saveConfig,
  saveRecords,
} from './lib/storage';
import { syncWithSheet } from './lib/sync';
import Dashboard from './components/Dashboard';
import AddRecord from './components/AddRecord';
import History from './components/History';
import Settings from './components/Settings';

type Tab = 'dashboard' | 'add' | 'history' | 'settings';

export default function App() {
  const [records, setRecords] = useState<ParkingRecord[]>(() => loadRecords());
  const [config, setConfig] = useState<AppConfig>(() => loadConfig());
  const [tab, setTab] = useState<Tab>('dashboard');
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string>('');

  // Persist on every change.
  useEffect(() => saveRecords(records), [records]);
  useEffect(() => saveConfig(config), [config]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const pendingCount = useMemo(
    () => records.filter((r) => r.dirty || r.deleted).length,
    [records],
  );

  const connected = !!config.googleClientId && !!config.spreadsheetId;

  async function handleSync() {
    if (!connected) {
      setStatus('Connect Google Sheets in Settings first.');
      setTab('settings');
      return;
    }
    setSyncing(true);
    setStatus('Syncing…');
    try {
      const result = await syncWithSheet(config, records);
      setRecords(result.records);
      setStatus(result.pushed ? 'Pushed local changes to Sheet.' : 'Pulled latest from Sheet.');
    } catch (e) {
      setStatus(`Sync failed: ${(e as Error).message}`);
    } finally {
      setSyncing(false);
    }
  }

  function upsertRecord(rec: ParkingRecord) {
    setRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === rec.id);
      const marked = { ...rec, dirty: true };
      if (idx === -1) return [...prev, marked];
      const copy = [...prev];
      copy[idx] = marked;
      return copy;
    });
  }

  function deleteRecord(id: string) {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, deleted: true, dirty: true } : r)),
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>saman-track</h1>
        <div className="topbar-actions">
          <span className={`dot ${online ? 'on' : 'off'}`} title={online ? 'Online' : 'Offline'} />
          <button className="sync-btn" onClick={handleSync} disabled={syncing}>
            {syncing ? '…' : `Sync${pendingCount ? ` (${pendingCount})` : ''}`}
          </button>
        </div>
      </header>

      {status && <div className="status-bar" onClick={() => setStatus('')}>{status}</div>}

      <main className="content">
        {tab === 'dashboard' && <Dashboard records={records} />}
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
          <Settings config={config} onChange={setConfig} connected={connected} />
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
          ⚙️<span>Settings</span>
        </button>
      </nav>
    </div>
  );
}
