import { ParkingRecord, Settings } from '../types';
import { computeTotals, formatRM } from '../lib/calc';
import { fineTimeSummary } from '../lib/timeAnalysis';
import { peakWindowSavings } from '../lib/peakWindowSavings';
import FineTimeChart from './FineTimeChart';

export default function Dashboard({
  records,
  settings,
}: {
  records: ParkingRecord[];
  settings: Settings;
}) {
  const t = computeTotals(records);
  const summary = fineTimeSummary(records);
  const pw = peakWindowSavings(records, settings);

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

      <div className="card">
        <h2>Pay during the peak window?</h2>
        {pw.hasData ? (
          <>
            <p className="muted">
              Pay <strong>{formatRM(settings.ratePer30Min)}/30min</strong> to cover the{' '}
              <strong>{pw.windowLabel}</strong> window{' '}
              (catches {pw.finesInWindow} of {pw.fines}{' '}
              fine{pw.fines === 1 ? '' : 's'}; {pw.finesOutWindow} still slip through).
            </p>

            <div className="scenario-grid">
              <div className="scenario">
                <span className="scenario-label">Never pay (now)</span>
                <span className="scenario-value">{formatRM(pw.costNeverPay)}</span>
                <span className="stat-sub">RM10 × {pw.fines} fines</span>
              </div>
              <div className="scenario best">
                <span className="scenario-label">Pay peak window</span>
                <span className="scenario-value">{formatRM(pw.costPeakWindow)}</span>
                <span className="stat-sub">
                  {pw.days}×{pw.windowBlocks}×30min parking + {pw.finesOutWindow} fines
                </span>
              </div>
              <div className="scenario">
                <span className="scenario-label">Pay full span</span>
                <span className="scenario-value">{formatRM(pw.costFullCoverage)}</span>
                <span className="stat-sub">
                  {pw.days}×{pw.spanBlocks}×30min ({pw.spanLabel}), no fines
                </span>
              </div>
            </div>

            <p className={`muted ${pw.savingsVsNeverPay >= 0 ? 'good' : 'bad'}`}>
              vs never paying, the peak-window plan{' '}
              <strong>
                {pw.savingsVsNeverPay >= 0 ? 'saves' : 'costs'}{' '}
                {formatRM(Math.abs(pw.savingsVsNeverPay))}
              </strong>
              .
            </p>
            <p className={`muted ${pw.savingsVsFullCoverage >= 0 ? 'good' : 'bad'}`}>
              vs paying the full span, it{' '}
              <strong>
                {pw.savingsVsFullCoverage >= 0 ? 'saves' : 'costs'}{' '}
                {formatRM(Math.abs(pw.savingsVsFullCoverage))}
              </strong>
              .
            </p>
          </>
        ) : (
          <p className="muted">
            Log a few fines (with times) and this will show how much the peak-window plan
            saves. Tune the rate and window length in <strong>Data</strong> settings.
          </p>
        )}
      </div>

      <div className="card mini">
        <span>{t.days} days tracked</span>
        <span>{t.fines} fined ({t.days ? Math.round((t.fines / t.days) * 100) : 0}%)</span>
      </div>
    </div>
  );
}
