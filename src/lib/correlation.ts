import { CleanSalesRecord } from '../types/sales';
import { CorrelationResults } from '../types/analysis';

/**
 * Calculates Pearson's Product-Moment Correlation Coefficient (r):
 * r = Sum[(x_i - mean_x) * (y_i - mean_y)] / sqrt( Sum[(x_i - mean_x)^2] * Sum[(y_i - mean_y)^2] )
 */
export function calculateCorrelation(records: CleanSalesRecord[]): CorrelationResults {
  const n = records.length;
  const minSamplesNeeded = 3;

  if (n < 2) {
    return {
      isCalculable: false,
      uncalculableReason: 'At least 2 observations are required to calculate correlation.',
      r: 0,
      strength: 'none',
      direction: 'neutral',
      interpretation: 'Insufficient data points to evaluate correlation.',
      isSampleSizeCautious: true,
      minSamplesNeeded
    };
  }

  const xVals = records.map(r => r.discount_pct);
  const yVals = records.map(r => r.units_sold);

  const meanX = xVals.reduce((a, b) => a + b, 0) / n;
  const meanY = yVals.reduce((a, b) => a + b, 0) / n;

  let ssxx = 0;
  let ssyy = 0;
  let ssxy = 0;

  for (let i = 0; i < n; i++) {
    const dx = xVals[i] - meanX;
    const dy = yVals[i] - meanY;
    ssxx += dx * dx;
    ssyy += dy * dy;
    ssxy += dx * dy;
  }

  if (Math.abs(ssxx) < 1e-12) {
    return {
      isCalculable: false,
      uncalculableReason: 'Zero variance in discount percentage (all discounts are identical). Correlation is mathematically undefined.',
      r: 0,
      strength: 'none',
      direction: 'neutral',
      interpretation: 'Discounts do not vary across observations, so correlation cannot be determined.',
      isSampleSizeCautious: n < 10,
      minSamplesNeeded
    };
  }

  if (Math.abs(ssyy) < 1e-12) {
    return {
      isCalculable: false,
      uncalculableReason: 'Zero variance in units sold (sales are constant across all records). Correlation is mathematically undefined.',
      r: 0,
      strength: 'none',
      direction: 'neutral',
      interpretation: 'Units sold are identical across all observations, so correlation cannot be determined.',
      isSampleSizeCautious: n < 10,
      minSamplesNeeded
    };
  }

  const denominator = Math.sqrt(ssxx * ssyy);
  let r = ssxy / denominator;

  // Clamp r to [-1, 1] to avoid minor floating point imprecision (> 1.0 or < -1.0)
  r = Math.max(-1, Math.min(1, r));

  const absR = Math.abs(r);
  let strength: 'strong' | 'moderate' | 'weak' | 'none';
  if (absR >= 0.70) {
    strength = 'strong';
  } else if (absR >= 0.30) {
    strength = 'moderate';
  } else if (absR > 0.05) {
    strength = 'weak';
  } else {
    strength = 'none';
  }

  let direction: 'positive' | 'negative' | 'neutral';
  if (r > 0.01) {
    direction = 'positive';
  } else if (r < -0.01) {
    direction = 'negative';
  } else {
    direction = 'neutral';
  }

  let interpretation = '';
  if (direction === 'positive') {
    interpretation = `There is a ${strength} positive linear association (r = ${r.toFixed(3)}) between discount percentage and units sold. Higher discounts consistently co-occur with higher sales volumes in this sample. (Note: correlation implies linear association, not direct causation).`;
  } else if (direction === 'negative') {
    interpretation = `There is a ${strength} negative linear association (r = ${r.toFixed(3)}) between discount percentage and units sold. Higher discounts co-occur with lower sales volumes in this sample.`;
  } else {
    interpretation = `There is virtually no linear association (r = ${r.toFixed(3)}) between discount percentage and units sold. Discounts do not show a systematic linear pattern with sales.`;
  }

  return {
    isCalculable: true,
    r,
    strength,
    direction,
    interpretation,
    isSampleSizeCautious: n < 10,
    minSamplesNeeded
  };
}
