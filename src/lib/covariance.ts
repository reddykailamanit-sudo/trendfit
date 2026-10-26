import { CleanSalesRecord } from '../types/sales';
import { CovarianceResults } from '../types/analysis';

/**
 * Calculates the 2x2 sample covariance matrix using denominator (n - 1):
 * C = [ [Var(D),   Cov(D,S)],
 *       [Cov(D,S), Var(S)  ] ]
 * 
 * where:
 *   Var(D)   = Sum[(D_i - mean_D)^2] / (n - 1)
 *   Var(S)   = Sum[(S_i - mean_S)^2] / (n - 1)
 *   Cov(D,S) = Sum[(D_i - mean_D)(S_i - mean_S)] / (n - 1)
 */
export function calculateCovarianceMatrix(records: CleanSalesRecord[]): CovarianceResults {
  const n = records.length;

  if (n < 2) {
    return {
      isCalculable: false,
      uncalculableReason: 'Sample covariance requires at least 2 observations for degree-of-freedom n - 1.',
      n,
      meanD: records.length === 1 ? records[0].discount_pct : 0,
      meanS: records.length === 1 ? records[0].units_sold : 0,
      varD: 0,
      varS: 0,
      covDS: 0,
      matrix: [[0, 0], [0, 0]]
    };
  }

  const dVals = records.map(r => r.discount_pct);
  const sVals = records.map(r => r.units_sold);

  const meanD = dVals.reduce((a, b) => a + b, 0) / n;
  const meanS = sVals.reduce((a, b) => a + b, 0) / n;

  let sumDevDSquared = 0;
  let sumDevSSquared = 0;
  let sumDevDDevS = 0;

  for (let i = 0; i < n; i++) {
    const devD = dVals[i] - meanD;
    const devS = sVals[i] - meanS;
    sumDevDSquared += devD * devD;
    sumDevSSquared += devS * devS;
    sumDevDDevS += devD * devS;
  }

  const denom = n - 1;
  const varD = sumDevDSquared / denom;
  const varS = sumDevSSquared / denom;
  const covDS = sumDevDDevS / denom;

  return {
    isCalculable: true,
    n,
    meanD,
    meanS,
    varD,
    varS,
    covDS,
    matrix: [
      [varD, covDS],
      [covDS, varS]
    ]
  };
}
