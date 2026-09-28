// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ParkingRecord, Settings } from '../types';
import Dashboard from './Dashboard';

vi.mock('./FineTimeChart', () => ({
  default: () => <div data-testid="fine-time-chart" />,
}));

afterEach(cleanup);

describe('Dashboard cost scenarios', () => {
  it('highlights the actual lowest-cost scenario instead of the peak window', () => {
    const records: ParkingRecord[] = Array.from({ length: 10 }, (_, index) => ({
      id: String(index),
      date: `2026-09-${String(index + 1).padStart(2, '0')}`,
      fined: index === 0,
      fineTime: index === 0 ? '08:30' : '',
      createdAt: new Date(2026, 8, index + 1).toISOString(),
    }));
    const settings: Settings = {
      ratePer30Min: 0.6,
      payStart: '08:00',
      payEnd: '09:00',
    };

    const { container } = render(<Dashboard records={records} settings={settings} />);
    const neverPay = container.querySelector('[data-strategy="neverPay"]');
    const peakWindow = container.querySelector('[data-strategy="peakWindow"]');
    const fullCoverage = container.querySelector('[data-strategy="fullCoverage"]');

    expect(neverPay?.classList.contains('best')).toBe(true);
    expect(peakWindow?.classList.contains('best')).toBe(false);
    expect(fullCoverage?.classList.contains('best')).toBe(false);
    expect(screen.getAllByText('Lowest cost')).toHaveLength(1);
    expect(screen.getByText('Never pay (now)', { selector: 'strong' })).toBeTruthy();
  });
});
