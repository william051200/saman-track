import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ParkingRecord } from '../types';
import { fineTimeHistogram } from '../lib/timeAnalysis';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function FineTimeChart({ records }: { records: ParkingRecord[] }) {
  const hist = fineTimeHistogram(records);
  const hasData = hist.some((b) => b.count > 0);

  if (!hasData) {
    return <p className="muted">No fines recorded yet — chart will appear once you log a fine.</p>;
  }

  return (
    <Bar
      data={{
        labels: hist.map((b) => b.label),
        datasets: [
          {
            label: 'Fines',
            data: hist.map((b) => b.count),
            backgroundColor: '#f59e0b',
            borderRadius: 4,
          },
        ],
      }}
      options={{
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94a3b8', maxRotation: 0, autoSkip: true } },
          y: {
            ticks: { color: '#94a3b8', precision: 0 },
            grid: { color: 'rgba(148,163,184,0.15)' },
            beginAtZero: true,
          },
        },
      }}
    />
  );
}
