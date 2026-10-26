import { describe, it, expect } from 'vitest';
import { calculateLinearRegression } from '../lib/regression';
import { calculateCorrelation } from '../lib/correlation';
import { predictUnitsSold } from '../lib/predictions';
import { CleanSalesRecord } from '../types/sales';

describe('Regression & Correlation Calculations', () => {
  // Test fixture 1: Clean sample records from problem statement
  // (5, 20), (10, 27), (15, 32), (20, 41), (25, 46), (10, 29), (30, 53), (15, 35)
  // x = [5, 10, 15, 20, 25, 10, 30, 15] => sum = 130, mean = 16.25
  // y = [20, 27, 32, 41, 46, 29, 53, 35] => sum = 283, mean = 35.375
  const sampleRecords: CleanSalesRecord[] = [
    { id: '1', date: '2026-10-01', discount_pct: 5, units_sold: 20 },
    { id: '2', date: '2026-10-02', discount_pct: 10, units_sold: 27 },
    { id: '3', date: '2026-10-03', discount_pct: 15, units_sold: 32 },
    { id: '4', date: '2026-10-04', discount_pct: 20, units_sold: 41 },
    { id: '5', date: '2026-10-05', discount_pct: 25, units_sold: 46 },
    { id: '6', date: '2026-10-06', discount_pct: 10, units_sold: 29 },
    { id: '7', date: '2026-10-07', discount_pct: 30, units_sold: 53 },
    { id: '8', date: '2026-10-08', discount_pct: 15, units_sold: 35 },
  ];

  it('calculates slope and intercept accurately for standard dataset', () => {
    const reg = calculateLinearRegression(sampleRecords);
    expect(reg.isCalculable).toBe(true);
    expect(reg.n).toBe(8);
    expect(reg.meanDiscount).toBeCloseTo(16.25, 4);
    expect(reg.meanUnits).toBeCloseTo(35.375, 4);

    // Verify slope b = sum(dx*dy)/sum(dx^2)
    // dx = [-11.25, -6.25, -1.25, 3.75, 8.75, -6.25, 13.75, -1.25]
    // dy = [-15.375, -8.375, -3.375, 5.625, 10.625, -6.375, 17.625, -0.375]
    // sum(dx^2) = 126.5625 + 39.0625 + 1.5625 + 14.0625 + 76.5625 + 39.0625 + 189.0625 + 1.5625 = 487.5
    // sum(dx*dy) = 172.96875 + 52.34375 + 4.21875 + 21.09375 + 92.96875 + 39.84375 + 242.34375 + 0.46875 = 626.25
    // b = 626.25 / 487.5 = 1.284615...
    // a = 35.375 - 1.284615 * 16.25 = 14.5
    expect(reg.slope).toBeCloseTo(1.2846, 3);
    expect(reg.intercept).toBeCloseTo(14.5, 2);
    expect(reg.rSquared).toBeGreaterThan(0.95); // High linear fit
  });

  it('calculates Pearson correlation coefficient correctly', () => {
    const corr = calculateCorrelation(sampleRecords);
    expect(corr.isCalculable).toBe(true);
    expect(corr.r).toBeGreaterThan(0.98); // Strong positive correlation
    expect(corr.strength).toBe('strong');
    expect(corr.direction).toBe('positive');
  });

  it('handles edge case: zero records', () => {
    const emptyReg = calculateLinearRegression([]);
    expect(emptyReg.isCalculable).toBe(false);
    expect(emptyReg.slope).toBe(0);

    const emptyCorr = calculateCorrelation([]);
    expect(emptyCorr.isCalculable).toBe(false);
  });

  it('handles edge case: single record', () => {
    const single = [sampleRecords[0]];
    const reg = calculateLinearRegression(single);
    expect(reg.isCalculable).toBe(false);
    expect(reg.uncalculableReason).toContain('at least two distinct data points');
  });

  it('handles edge case: constant discount (zero variance in X)', () => {
    const constantX: CleanSalesRecord[] = [
      { id: '1', date: '2026-10-01', discount_pct: 10, units_sold: 20 },
      { id: '2', date: '2026-10-02', discount_pct: 10, units_sold: 30 },
      { id: '3', date: '2026-10-03', discount_pct: 10, units_sold: 40 },
    ];
    const reg = calculateLinearRegression(constantX);
    expect(reg.isCalculable).toBe(false);
    expect(reg.uncalculableReason).toContain('zero variance in X');

    const corr = calculateCorrelation(constantX);
    expect(corr.isCalculable).toBe(false);
    expect(corr.uncalculableReason).toContain('Zero variance in discount percentage');
  });

  it('handles edge case: constant units sold (zero variance in Y)', () => {
    const constantY: CleanSalesRecord[] = [
      { id: '1', date: '2026-10-01', discount_pct: 5, units_sold: 25 },
      { id: '2', date: '2026-10-02', discount_pct: 15, units_sold: 25 },
      { id: '3', date: '2026-10-03', discount_pct: 25, units_sold: 25 },
    ];
    const reg = calculateLinearRegression(constantY);
    expect(reg.isCalculable).toBe(true);
    expect(reg.slope).toBeCloseTo(0, 5);
    expect(reg.intercept).toBeCloseTo(25, 5);

    const corr = calculateCorrelation(constantY);
    expect(corr.isCalculable).toBe(false);
    expect(corr.uncalculableReason).toContain('Zero variance in units sold');
  });

  it('computes sales predictions and flags extrapolation correctly', () => {
    const reg = calculateLinearRegression(sampleRecords);
    // Interpolation (within observed range 5% to 30%)
    const pred15 = predictUnitsSold(15, reg);
    expect(pred15).not.toBeNull();
    expect(pred15?.isExtrapolation).toBe(false);
    expect(pred15?.predictedUnits).toBe(Math.round(14.5 + 1.2846 * 15));

    // Extrapolation below min (2%)
    const predLow = predictUnitsSold(2, reg);
    expect(predLow?.isExtrapolation).toBe(true);
    expect(predLow?.extrapolationReason).toContain('lower than minimum observed discount');

    // Extrapolation above max (50%)
    const predHigh = predictUnitsSold(50, reg);
    expect(predHigh?.isExtrapolation).toBe(true);
    expect(predHigh?.extrapolationReason).toContain('higher than maximum observed discount');
  });
});
