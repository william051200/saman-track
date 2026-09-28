import { useEffect, useMemo, useState } from 'react';
import { ParkingRecord, Settings as AppSettings } from './types';
import { loadRecords, saveRecords } from './lib/storage';
import { loadSettings, saveSettings } from './lib/settings';
import { hasLinkedFile, writeLinkedFile } from './lib/fileStore';
import { activeRecords } from './lib/calc';
import appVersion from '../VERSION?raw';
import Dashboard from './components/Dashboard';
import AddRecord from './components/AddRecord';
import History from './components/History';
import Settings from './components/Settings';
import About from './components/About';
import AppMenu, { MenuPage } from './components/AppMenu';

type Page = 'dashboard' | 'add' | 'history' | MenuPage;

export default function App() {
  const [records, setRecords] = useState<ParkingRecord[]>(() => loadRecords());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [page, setPage] = useState<Page>('dashboard');
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

  function addRecord(rec: ParkingRecord) {
    const existing = records.find((r) => !r.deleted && r.date === rec.date);
    if (!existing) {
      setRecords((prev) => [...prev, rec]);
      setStatus('Saved.');
      return;
    }

    setRecords((prev) =>
      prev.map((r) =>
        r.id === existing.id
          ? {
              ...rec,
              id: existing.id,
              createdAt: existing.createdAt,
            }
          : r,
      ),
    );
    setStatus(`Updated existing record for ${rec.date}.`);
  }

  function deleteRecord(id: string) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>
          saman-track <span className="app-version">v{appVersion.trim()}</span>
        </h1>
        <div className="topbar-actions">
          <span className="count-pill">{dayCount} days</span>
          <AppMenu currentPage={page} onNavigate={setPage} />
        </div>
      </header>

      {status && (
        <div className="status-bar" onClick={() => setStatus('')}>
          {status}
        </div>
      )}

      <main className="content">
        {page === 'dashboard' && <Dashboard records={records} settings={settings} />}
        {page === 'add' && (
          <AddRecord
            onSave={(rec) => {
              addRecord(rec);
              setPage('history');
            }}
          />
        )}
        {page === 'history' && (
          <History records={records} onEdit={upsertRecord} onDelete={deleteRecord} />
        )}
        {page === 'settings' && (
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
        {page === 'about' && <About />}
      </main>

      <nav className="tabbar" aria-label="Primary navigation">
        <button
          className={page === 'dashboard' ? 'active' : ''}
          onClick={() => setPage('dashboard')}
        >
          📊<span>Stats</span>
        </button>
        <button className={page === 'add' ? 'active' : ''} onClick={() => setPage('add')}>
          ➕<span>Add</span>
        </button>
        <button
          className={page === 'history' ? 'active' : ''}
          onClick={() => setPage('history')}
        >
          📜<span>History</span>
        </button>
      </nav>
    </div>
  );
}
