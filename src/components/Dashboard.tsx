import { ParkingRecord, Settings } from '../types';
import { computeTotals, formatRM } from '../lib/calc';
import { fineTimeSummary } from '../lib/timeAnalysis';
import {
  CostStrategyId,
  lowestCostStrategies,
  peakWindowSavings,
} from '../lib/peakWindowSavings';
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
  const scenarios: Array<{
    id: CostStrategyId;
    label: string;
    cost: number;
    detail: string;
  }> = [
    {
      id: 'neverPay',
      label: 'Never pay (now)',
      cost: pw.costNeverPay,
      detail: `RM10 × ${pw.fines} fines`,
    },
    {
      id: 'peakWindow',
      label: 'Pay peak window',
      cost: pw.costPeakWindow,
      detail: `${pw.days}×${pw.windowBlocks}×30min parking + ${pw.finesOutWindow} fines`,
    },
    {
      id: 'fullCoverage',
      label: 'Pay full span',
      cost: pw.costFullCoverage,
      detail: `${pw.days}×${pw.spanBlocks}×30min (${pw.spanLabel}), no fines`,
    },
  ];
  const lowestIds = pw.hasData ? lowestCostStrategies(pw) : [];
  const lowestLabels = scenarios
    .filter((scenario) => lowestIds.includes(scenario.id))
    .map((scenario) => scenario.label);

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
              {scenarios.map((scenario) => {
                const isLowest = lowestIds.includes(scenario.id);
                return (
                  <div
                    key={scenario.id}
                    className={`scenario${isLowest ? ' best' : ''}`}
                    data-strategy={scenario.id}
                  >
                    <span className="scenario-label">{scenario.label}</span>
                    {isLowest && <span className="lowest-badge">Lowest cost</span>}
                    <span className="scenario-value">{formatRM(scenario.cost)}</span>
                    <span className="stat-sub">{scenario.detail}</span>
                  </div>
                );
              })}
            </div>

            <p className="lowest-summary">
              Lowest-cost {lowestLabels.length === 1 ? 'option' : 'options'}:{' '}
              <strong>{lowestLabels.join(' and ')}</strong>
            </p>
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
            saves. Tune the rate and window length under <strong>Data</strong> in the
            top-right menu.
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
