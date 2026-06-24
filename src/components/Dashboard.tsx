import { ParkingRecord } from '../types';
import { computeTotals, formatRM } from '../lib/calc';
import { fineTimeSummary } from '../lib/timeAnalysis';
import FineTimeChart from './FineTimeChart';

export default function Dashboard({ records }: { records: ParkingRecord[] }) {
  const t = computeTotals(records);
  const summary = fineTimeSummary(records);

  return (
    <div className="dashboard">
      <div className="stat-grid">
        <div className={`card stat ${t.netSavings >= 0 ? 'good' : 'bad'}`}>
          <span className="stat-label">Net savings</span>
          <span className="stat-value">{formatRM(t.netSavings)}</span>
          <span className="stat-sub">RM9 × {t.days} days − RM10 × {t.fines} fines</span>
        </div>

        <div className="card stat">
          <span className="stat-label">Total saved (before fines)</span>
          <span className="stat-value">{formatRM(t.totalSavedBeforeFines)}</span>
          <span className="stat-sub">RM9 × {t.days} parked days</span>
        </div>

        <div className="card stat bad">
          <span className="stat-label">Total fined</span>
          <span className="stat-value">{formatRM(t.totalFined)}</span>
          <span className="stat-sub">RM10 × {t.fines} fines</span>
        </div>
      </div>

      <div className="card">
        <h2>When do fines happen?</h2>
        {summary.count > 0 && (
          <p className="muted">
            Peak window <strong>{summary.peakWindow}</strong> · average{' '}
            <strong>{summary.average}</strong> · {summary.count} fine
            {summary.count === 1 ? '' : 's'}
          </p>
        )}
        <FineTimeChart records={records} />
      </div>

      <div className="card mini">
        <span>{t.days} days tracked</span>
        <span>{t.fines} fined ({t.days ? Math.round((t.fines / t.days) * 100) : 0}%)</span>
      </div>
    </div>
  );
}
