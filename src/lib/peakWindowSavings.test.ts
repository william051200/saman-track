import { describe, expect, it } from 'vitest';
import { lowestCostStrategies } from './peakWindowSavings';

describe('lowestCostStrategies', () => {
  it.each([
    [
      'never pay',
      { costNeverPay: 10, costPeakWindow: 20, costFullCoverage: 30 },
      ['neverPay'],
    ],
    [
      'peak window',
      { costNeverPay: 20, costPeakWindow: 10, costFullCoverage: 30 },
      ['peakWindow'],
    ],
    [
      'full coverage',
      { costNeverPay: 30, costPeakWindow: 20, costFullCoverage: 10 },
      ['fullCoverage'],
    ],
    [
      'a two-way tie',
      { costNeverPay: 10, costPeakWindow: 10, costFullCoverage: 30 },
      ['neverPay', 'peakWindow'],
    ],
    [
      'a three-way tie',
      { costNeverPay: 10, costPeakWindow: 10, costFullCoverage: 10 },
      ['neverPay', 'peakWindow', 'fullCoverage'],
    ],
  ])('returns the lowest strategy for %s', (_name, costs, expected) => {
    expect(lowestCostStrategies(costs)).toEqual(expected);
  });
});
