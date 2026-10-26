import { describe, it, expect } from 'vitest';
import { calculateCovarianceMatrix } from '../lib/covariance';
import { CleanSalesRecord } from '../types/sales';

describe('Covariance Matrix Calculations', () => {
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

  it('computes 2x2 sample covariance with n - 1 denominator', () => {
    const cov = calculateCovarianceMatrix(sampleRecords);
    expect(cov.isCalculable).toBe(true);
    expect(cov.n).toBe(8);

    // n = 8, denom = 7
    // sum(dx^2) = 487.5 => Var(D) = 487.5 / 7 = 69.642857...
    // sum(dy^2) = 813.875 => Var(S) = 813.875 / 7 = 116.267857...
    // sum(dx*dy) = 626.25 => Cov(D,S) = 626.25 / 7 = 89.464285...
    expect(cov.varD).toBeCloseTo(69.6428, 3);
    expect(cov.varS).toBeCloseTo(116.2679, 3);
    expect(cov.covDS).toBeCloseTo(89.4642, 3);

    // Check symmetry
    expect(cov.matrix[0][1]).toBe(cov.matrix[1][0]);
    expect(cov.matrix[0][0]).toBe(cov.varD);
    expect(cov.matrix[1][1]).toBe(cov.varS);
  });

  it('handles edge case: fewer than 2 records', () => {
    const single = [sampleRecords[0]];
    const cov = calculateCovarianceMatrix(single);
    expect(cov.isCalculable).toBe(false);
    expect(cov.uncalculableReason).toContain('requires at least 2 observations');
  });
});
