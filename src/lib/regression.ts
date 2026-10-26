import { CleanSalesRecord } from '../types/sales';
import { RegressionResults } from '../types/analysis';

/**
 * Calculates simple least-squares linear regression:
 * y_hat = a + b * x
 * where:
 *   x = discount_pct
 *   y = units_sold
 *   b = Sum[(x_i - mean_x) * (y_i - mean_y)] / Sum[(x_i - mean_x)^2]
 *   a = mean_y - b * mean_x
 */
export function calculateLinearRegression(records: CleanSalesRecord[]): RegressionResults {
  const n = records.length;

  if (n === 0) {
    return {
      isCalculable: false,
      uncalculableReason: 'No valid data records available for regression.',
      n: 0,
      meanDiscount: 0,
      meanUnits: 0,
      slope: 0,
      intercept: 0,
      equation: 'y = N/A',
      sse: 0,
      sst: 0,
      ssr: 0,
      rSquared: 0,
      rmse: 0,
      minObservedDiscount: 0,
      maxObservedDiscount: 0,
      minObservedUnits: 0,
      maxObservedUnits: 0,
      steps: { sumX: 0, sumY: 0, sumXY: 0, sumX2: 0, sumY2: 0, ssxx: 0, ssyy: 0, ssxy: 0 }
    };
  }

  const xVals = records.map(r => r.discount_pct);
  const yVals = records.map(r => r.units_sold);

  const minObservedDiscount = Math.min(...xVals);
  const maxObservedDiscount = Math.max(...xVals);
  const minObservedUnits = Math.min(...yVals);
  const maxObservedUnits = Math.max(...yVals);

  if (n < 2) {
    return {
      isCalculable: false,
      uncalculableReason: 'Linear regression requires at least two distinct data points.',
      n,
      meanDiscount: xVals[0],
      meanUnits: yVals[0],
      slope: 0,
      intercept: yVals[0],
      equation: `y = ${yVals[0].toFixed(2)} (single point, undefined slope)`,
      sse: 0,
      sst: 0,
      ssr: 0,
      rSquared: 0,
      rmse: 0,
      minObservedDiscount,
      maxObservedDiscount,
      minObservedUnits,
      maxObservedUnits,
      steps: { sumX: xVals[0], sumY: yVals[0], sumXY: xVals[0] * yVals[0], sumX2: xVals[0] ** 2, sumY2: yVals[0] ** 2, ssxx: 0, ssyy: 0, ssxy: 0 }
    };
  }

  // Two-pass calculation for numerical stability
  const sumX = xVals.reduce((acc, v) => acc + v, 0);
  const sumY = yVals.reduce((acc, v) => acc + v, 0);
  const meanDiscount = sumX / n;
  const meanUnits = sumY / n;

  let ssxx = 0;
  let ssyy = 0;
  let ssxy = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const dx = xVals[i] - meanDiscount;
    const dy = yVals[i] - meanUnits;
    ssxx += dx * dx;
    ssyy += dy * dy;
    ssxy += dx * dy;
    sumXY += xVals[i] * yVals[i];
    sumX2 += xVals[i] * xVals[i];
    sumY2 += yVals[i] * yVals[i];
  }

  // Handle case with zero variance in x (all discount values are the same)
  if (Math.abs(ssxx) < 1e-12) {
    return {
      isCalculable: false,
      uncalculableReason: 'Discount percentage is constant across all records (zero variance in X). A vertical line cannot be fitted with y = a + bx.',
      n,
      meanDiscount,
      meanUnits,
      slope: 0,
      intercept: 0,
      equation: `x = ${meanDiscount.toFixed(1)}% (vertical line)`,
      sse: 0,
      sst: ssyy,
      ssr: 0,
      rSquared: 0,
      rmse: 0,
      minObservedDiscount,
      maxObservedDiscount,
      minObservedUnits,
      maxObservedUnits,
      steps: { sumX, sumY, sumXY, sumX2, sumY2, ssxx, ssyy, ssxy }
    };
  }

  const slope = ssxy / ssxx;
  const intercept = meanUnits - slope * meanDiscount;

  // Goodness of fit calculations:
  // SSE = Sum[(y_i - y_hat_i)^2]
  // SST = Sum[(y_i - mean_y)^2] = ssyy
  let sse = 0;
  for (let i = 0; i < n; i++) {
    const yHat = intercept + slope * xVals[i];
    const residual = yVals[i] - yHat;
    sse += residual * residual;
  }

  const sst = ssyy;
  const ssr = Math.max(0, sst - sse);

  // R^2: if SST is zero (all y are identical), R^2 = 1 if SSE=0 else 0
  let rSquared = 0;
  if (sst > 1e-12) {
    rSquared = Math.max(0, Math.min(1, 1 - (sse / sst)));
  } else if (sse < 1e-12) {
    rSquared = 1; // perfectly fits constant line
  }

  // RMSE = sqrt(SSE / n)
  const rmse = Math.sqrt(sse / n);

  const sign = slope >= 0 ? '+' : '-';
  const absSlope = Math.abs(slope);
  const equation = `ŷ = ${intercept.toFixed(2)} ${sign} ${absSlope.toFixed(2)}x`;

  return {
    isCalculable: true,
    n,
    meanDiscount,
    meanUnits,
    slope,
    intercept,
    equation,
    sse,
    sst,
    ssr,
    rSquared,
    rmse,
    minObservedDiscount,
    maxObservedDiscount,
    minObservedUnits,
    maxObservedUnits,
    steps: { sumX, sumY, sumXY, sumX2, sumY2, ssxx, ssyy, ssxy }
  };
}
