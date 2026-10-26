import { CovarianceResults, EigenAnalysisResults, Eigenvector } from '../types/analysis';

/**
 * Computes eigenvalues and normalized eigenvectors for the 2x2 covariance matrix C:
 * C = [ [a, b],
 *       [b, d] ]
 * 
 * Characteristic polynomial:
 * det(C - lambda*I) = lambda^2 - (a + d)*lambda + (a*d - b^2) = 0
 * 
 * Roots (eigenvalues):
 * lambda = [ (a + d) +/- sqrt((a - d)^2 + 4*b^2) ] / 2
 */
export function calculateEigenAnalysis(covResult: CovarianceResults): EigenAnalysisResults {
  if (!covResult.isCalculable) {
    return {
      isCalculable: false,
      uncalculableReason: covResult.uncalculableReason || 'Covariance matrix is not calculable.',
      lambda1: 0,
      lambda2: 0,
      vector1: { x: 0, y: 0 },
      vector2: { x: 0, y: 0 },
      evr1: 0,
      evr2: 0,
      totalVariance: 0,
      principalDirectionSummary: 'Eigenvalue analysis unavailable.',
      verificationResidual1: 0,
      verificationResidual2: 0,
      isOrthogonal: false
    };
  }

  const [[a, b], [, d]] = covResult.matrix;

  const trace = a + d;
  const det = a * d - b * b;

  // Discriminant: (a - d)^2 + 4*b^2 is mathematically >= 0 for any real symmetric matrix
  const discriminant = Math.max(0, (a - d) * (a - d) + 4 * b * b);
  const sqrtDisc = Math.sqrt(discriminant);

  // Sorted descending: lambda1 >= lambda2
  let lambda1 = (trace + sqrtDisc) / 2;
  let lambda2 = (trace - sqrtDisc) / 2;

  // Clamp tiny negative values caused by floating-point rounding
  if (Math.abs(lambda1) < 1e-12) lambda1 = 0;
  if (Math.abs(lambda2) < 1e-12) lambda2 = 0;
  if (lambda1 < 0) lambda1 = 0;
  if (lambda2 < 0) lambda2 = 0;

  const totalVariance = lambda1 + lambda2;

  // Calculate Explained Variance Ratio (EVR)
  let evr1 = 0;
  let evr2 = 0;
  if (totalVariance > 1e-12) {
    evr1 = lambda1 / totalVariance;
    evr2 = lambda2 / totalVariance;
  }

  // Calculate normalized eigenvectors
  let vector1: Eigenvector;
  let vector2: Eigenvector;

  const bThreshold = 1e-10;

  if (Math.abs(b) > bThreshold) {
    // Non-diagonal case:
    // (a - lambda)*x + b*y = 0  =>  y = (lambda - a)/b * x
    // Non-zero vector is [b, lambda - a]
    const rawX1 = b;
    const rawY1 = lambda1 - a;
    const norm1 = Math.sqrt(rawX1 * rawX1 + rawY1 * rawY1);

    // Normalize
    let v1x = rawX1 / (norm1 || 1);
    let v1y = rawY1 / (norm1 || 1);

    // Orientation convention: ensure v1.x >= 0 for intuitive directional plotting
    if (v1x < 0 || (v1x === 0 && v1y < 0)) {
      v1x = -v1x;
      v1y = -v1y;
    }
    vector1 = { x: v1x, y: v1y };

    // For symmetric 2x2, the second eigenvector is strictly orthogonal: [-v1y, v1x]
    // Or calculate from lambda2:
    const rawX2 = b;
    const rawY2 = lambda2 - a;
    const norm2 = Math.sqrt(rawX2 * rawX2 + rawY2 * rawY2);
    let v2x = rawX2 / (norm2 || 1);
    let v2y = rawY2 / (norm2 || 1);

    // Ensure v2 dot v1 ~ 0 and consistent right-handed coordinate orientation
    if (v1x * v2x + v1y * v2y > 1e-6) {
      v2x = -v2x;
      v2y = -v2y;
    }
    vector2 = { x: v2x, y: v2y };
  } else {
    // Diagonal matrix case: cov(D,S) ~ 0
    if (a >= d) {
      vector1 = { x: 1, y: 0 };
      vector2 = { x: 0, y: 1 };
    } else {
      vector1 = { x: 0, y: 1 };
      vector2 = { x: 1, y: 0 };
    }
  }

  // Numerical verification:
  // residual = || C * v - lambda * v ||
  const cv1x = a * vector1.x + b * vector1.y;
  const cv1y = b * vector1.x + d * vector1.y;
  const lv1x = lambda1 * vector1.x;
  const lv1y = lambda1 * vector1.y;
  const res1 = Math.sqrt((cv1x - lv1x) ** 2 + (cv1y - lv1y) ** 2);

  const cv2x = a * vector2.x + b * vector2.y;
  const cv2y = b * vector2.x + d * vector2.y;
  const lv2x = lambda2 * vector2.x;
  const lv2y = lambda2 * vector2.y;
  const res2 = Math.sqrt((cv2x - lv2x) ** 2 + (cv2y - lv2y) ** 2);

  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
  const isOrthogonal = Math.abs(dotProduct) < 1e-5;

  // Principal direction summary
  let principalDirectionSummary = '';
  if (totalVariance <= 1e-12) {
    principalDirectionSummary = 'Both variables have zero variance. Principal direction is degenerate.';
  } else if (evr1 >= 0.90) {
    principalDirectionSummary = `The first principal component accounts for ${(evr1 * 100).toFixed(1)}% of total variance, showing an overwhelming single dominant axis of variation.`;
  } else {
    principalDirectionSummary = `The first principal component accounts for ${(evr1 * 100).toFixed(1)}% of variance, and the second captures ${(evr2 * 100).toFixed(1)}%.`;
  }

  return {
    isCalculable: true,
    lambda1,
    lambda2,
    vector1,
    vector2,
    evr1,
    evr2,
    totalVariance,
    principalDirectionSummary,
    verificationResidual1: res1,
    verificationResidual2: res2,
    isOrthogonal
  };
}
