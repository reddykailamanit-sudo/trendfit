export interface RegressionResults {
  isCalculable: boolean;
  uncalculableReason?: string;
  n: number;
  meanDiscount: number;
  meanUnits: number;
  slope: number;
  intercept: number;
  equation: string;
  sse: number; // Sum of Squared Errors
  sst: number; // Total Sum of Squares
  ssr: number; // Regression Sum of Squares
  rSquared: number;
  rmse: number;
  minObservedDiscount: number;
  maxObservedDiscount: number;
  minObservedUnits: number;
  maxObservedUnits: number;
  steps: {
    sumX: number;
    sumY: number;
    sumXY: number;
    sumX2: number;
    sumY2: number;
    ssxx: number;
    ssyy: number;
    ssxy: number;
  };
}

export interface CorrelationResults {
  isCalculable: boolean;
  uncalculableReason?: string;
  r: number;
  strength: 'strong' | 'moderate' | 'weak' | 'none';
  direction: 'positive' | 'negative' | 'neutral';
  interpretation: string;
  isSampleSizeCautious: boolean;
  minSamplesNeeded: number;
}

export interface CovarianceResults {
  isCalculable: boolean;
  uncalculableReason?: string;
  n: number;
  meanD: number;
  meanS: number;
  varD: number; // Var(Discount)
  varS: number; // Var(Units Sold)
  covDS: number; // Cov(Discount, Units Sold)
  matrix: [[number, number], [number, number]];
}

export interface Eigenvector {
  x: number; // discount component
  y: number; // units sold component
}

export interface EigenAnalysisResults {
  isCalculable: boolean;
  uncalculableReason?: string;
  lambda1: number; // Largest eigenvalue
  lambda2: number; // Second eigenvalue
  vector1: Eigenvector; // Normalized eigenvector for lambda1
  vector2: Eigenvector; // Normalized eigenvector for lambda2
  evr1: number; // Explained variance ratio 1 (0 to 1)
  evr2: number; // Explained variance ratio 2 (0 to 1)
  totalVariance: number;
  principalDirectionSummary: string;
  verificationResidual1: number; // ||C*v1 - lambda1*v1||
  verificationResidual2: number; // ||C*v2 - lambda2*v2||
  isOrthogonal: boolean;
}

export interface InsightItem {
  type: 'trend' | 'caution' | 'recommendation' | 'stat';
  title: string;
  description: string;
  badge?: string;
}

export interface OverallAnalysis {
  regression: RegressionResults;
  correlation: CorrelationResults;
  covariance: CovarianceResults;
  eigen: EigenAnalysisResults;
  insights: InsightItem[];
}
