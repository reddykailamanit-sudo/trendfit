import { describe, it, expect } from 'vitest';
import { calculateCovarianceMatrix } from '../lib/covariance';
import { calculateEigenAnalysis } from '../lib/eigenAnalysis';
import { CleanSalesRecord } from '../types/sales';

describe('Eigenvalues and Eigenvectors Analysis (Unit I)', () => {
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

  it('calculates real eigenvalues in descending order with trace conservation', () => {
    const cov = calculateCovarianceMatrix(sampleRecords);
    const eigen = calculateEigenAnalysis(cov);

    expect(eigen.isCalculable).toBe(true);
    expect(eigen.lambda1).toBeGreaterThanOrEqual(eigen.lambda2);
    expect(eigen.lambda2).toBeGreaterThanOrEqual(0);

    // Trace conservation: lambda1 + lambda2 must equal Var(D) + Var(S)
    const trace = cov.varD + cov.varS;
    expect(eigen.lambda1 + eigen.lambda2).toBeCloseTo(trace, 5);
    expect(eigen.totalVariance).toBeCloseTo(trace, 5);

    // Sum of explained variance ratios must equal 1.0
    expect(eigen.evr1 + eigen.evr2).toBeCloseTo(1.0, 5);
    expect(eigen.evr1).toBeGreaterThan(0.9); // Dominant component
  });

  it('produces unit-length, orthogonal eigenvectors satisfying C*v = lambda*v', () => {
    const cov = calculateCovarianceMatrix(sampleRecords);
    const eigen = calculateEigenAnalysis(cov);

    // Check unit length
    const norm1 = Math.sqrt(eigen.vector1.x ** 2 + eigen.vector1.y ** 2);
    const norm2 = Math.sqrt(eigen.vector2.x ** 2 + eigen.vector2.y ** 2);
    expect(norm1).toBeCloseTo(1.0, 5);
    expect(norm2).toBeCloseTo(1.0, 5);

    // Check orthogonality: v1 . v2 == 0
    const dot = eigen.vector1.x * eigen.vector2.x + eigen.vector1.y * eigen.vector2.y;
    expect(dot).toBeCloseTo(0, 5);
    expect(eigen.isOrthogonal).toBe(true);

    // Check Cv = lambda*v (verification residual ~ 0)
    expect(eigen.verificationResidual1).toBeCloseTo(0, 4);
    expect(eigen.verificationResidual2).toBeCloseTo(0, 4);
  });

  it('handles known analytical 2x2 matrix fixture: C = [[4, 2], [2, 1]]', () => {
    // For C = [[4, 2], [2, 1]]:
    // trace = 5, det = 0
    // char eq: lambda^2 - 5*lambda = 0 => lambda1 = 5, lambda2 = 0
    // v1: (4 - 5)*x + 2*y = 0 => -x + 2y = 0 => [2, 1] normalized = [2/sqrt(5), 1/sqrt(5)] = [0.8944, 0.4472]
    // v2: [ -1/sqrt(5), 2/sqrt(5) ] = [-0.4472, 0.8944]
    const fixtureCov = {
      isCalculable: true,
      n: 5,
      meanD: 10,
      meanS: 20,
      varD: 4,
      varS: 1,
      covDS: 2,
      matrix: [[4, 2], [2, 1]] as [[number, number], [number, number]]
    };

    const eigen = calculateEigenAnalysis(fixtureCov);
    expect(eigen.isCalculable).toBe(true);
    expect(eigen.lambda1).toBeCloseTo(5.0, 5);
    expect(eigen.lambda2).toBeCloseTo(0.0, 5);
    expect(eigen.evr1).toBeCloseTo(1.0, 5);
    expect(eigen.evr2).toBeCloseTo(0.0, 5);

    expect(eigen.vector1.x).toBeCloseTo(2 / Math.sqrt(5), 4);
    expect(eigen.vector1.y).toBeCloseTo(1 / Math.sqrt(5), 4);
    expect(eigen.verificationResidual1).toBeCloseTo(0, 4);
  });

  it('handles diagonal covariance matrix (zero covariance)', () => {
    const diagCov = {
      isCalculable: true,
      n: 10,
      meanD: 15,
      meanS: 30,
      varD: 10,
      varS: 25,
      covDS: 0,
      matrix: [[10, 0], [0, 25]] as [[number, number], [number, number]]
    };

    const eigen = calculateEigenAnalysis(diagCov);
    expect(eigen.isCalculable).toBe(true);
    expect(eigen.lambda1).toBeCloseTo(25, 5); // sorted descending
    expect(eigen.lambda2).toBeCloseTo(10, 5);
    expect(eigen.vector1).toEqual({ x: 0, y: 1 });
    expect(eigen.vector2).toEqual({ x: 1, y: 0 });
  });
});
