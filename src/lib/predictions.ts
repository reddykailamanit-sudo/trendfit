import { RegressionResults } from '../types/analysis';

export interface PredictionResult {
  discountPct: number;
  predictedUnits: number;
  unroundedPredictedUnits: number;
  isExtrapolation: boolean;
  extrapolationReason?: string;
  diffFromMean: number;
  pctDiffFromMean: number;
  equationUsed: string;
}

export function predictUnitsSold(discountPct: number, regression: RegressionResults): PredictionResult | null {
  if (!regression.isCalculable) {
    return null;
  }

  const unrounded = regression.intercept + regression.slope * discountPct;
  const rounded = Math.max(0, Math.round(unrounded));

  const isBelowMin = discountPct < regression.minObservedDiscount;
  const isAboveMax = discountPct > regression.maxObservedDiscount;
  const isExtrapolation = isBelowMin || isAboveMax;

  let extrapolationReason: string | undefined;
  if (isBelowMin) {
    extrapolationReason = `Requested discount (${discountPct}%) is lower than minimum observed discount (${regression.minObservedDiscount}%). Extrapolating beyond observed range may be inaccurate.`;
  } else if (isAboveMax) {
    extrapolationReason = `Requested discount (${discountPct}%) is higher than maximum observed discount (${regression.maxObservedDiscount}%). Retail demand elasticity may drop at extreme discounts.`;
  }

  const diffFromMean = unrounded - regression.meanUnits;
  const pctDiffFromMean = regression.meanUnits > 0 ? (diffFromMean / regression.meanUnits) * 100 : 0;

  return {
    discountPct,
    predictedUnits: rounded,
    unroundedPredictedUnits: unrounded,
    isExtrapolation,
    extrapolationReason,
    diffFromMean,
    pctDiffFromMean,
    equationUsed: regression.equation
  };
}

export function generateScenarioPredictions(discounts: number[], regression: RegressionResults): PredictionResult[] {
  return discounts
    .map(d => predictUnitsSold(d, regression))
    .filter((p): p is PredictionResult => p !== null);
}
