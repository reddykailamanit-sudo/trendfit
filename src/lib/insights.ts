import { OverallAnalysis, InsightItem } from '../types/analysis';
import { CleanSalesRecord } from '../types/sales';

export function generateInsights(analysis: OverallAnalysis, records: CleanSalesRecord[]): InsightItem[] {
  const items: InsightItem[] = [];
  const { regression, correlation, eigen } = analysis;

  if (records.length === 0) {
    items.push({
      type: 'caution',
      title: 'No Dataset Loaded',
      description: 'Upload a sales CSV file or load the sample dataset to view dynamic statistical insights.',
      badge: 'Empty State'
    });
    return items;
  }

  if (records.length < 5) {
    items.push({
      type: 'caution',
      title: 'Small Sample Size Warning',
      description: `Only ${records.length} valid observations present. With fewer than 10 records, statistical estimates such as linear slope and correlation have wide confidence intervals and may not represent long-term customer behavior.`,
      badge: 'Data Limitation'
    });
  }

  // Regression & slope insight
  if (regression.isCalculable) {
    if (regression.slope > 0.1) {
      items.push({
        type: 'trend',
        title: 'Positive Sales Response to Discounts',
        description: `Each additional 1% discount is associated with an average increase of ${regression.slope.toFixed(2)} units sold. Baseline sales at 0% discount are estimated at ~${Math.max(0, regression.intercept).toFixed(1)} units.`,
        badge: 'Slope Analysis'
      });
    } else if (regression.slope < -0.1) {
      items.push({
        type: 'trend',
        title: 'Negative Sales Association',
        description: `Sales appear to decrease as discounts rise (slope: ${regression.slope.toFixed(2)}). This counter-intuitive pattern may indicate distress clearance or clearance of unpopular inventory.`,
        badge: 'Negative Trend'
      });
    } else {
      items.push({
        type: 'trend',
        title: 'Flat Response to Discount Changes',
        description: `The slope is near zero (${regression.slope.toFixed(2)}), suggesting units sold do not linearly respond to discount levels in this dataset.`,
        badge: 'Neutral'
      });
    }

    // R^2 goodness of fit
    const r2Pct = (regression.rSquared * 100).toFixed(1);
    if (regression.rSquared >= 0.75) {
      items.push({
        type: 'stat',
        title: 'Strong Predictive Fit (High R²)',
        description: `Discounts explain ${r2Pct}% of the variance in sales volume. The least-squares line fits the observed data closely with an average root-mean-square error of ±${regression.rmse.toFixed(1)} units.`,
        badge: `R² = ${r2Pct}%`
      });
    } else if (regression.rSquared >= 0.40) {
      items.push({
        type: 'stat',
        title: 'Moderate Predictive Fit',
        description: `Discounts account for ${r2Pct}% of sales variance. Other unrecorded factors (such as weekday vs. weekend, weather, or advertising) likely drive the remaining ${(100 - parseFloat(r2Pct)).toFixed(1)}% of sales fluctuations.`,
        badge: `R² = ${r2Pct}%`
      });
    } else {
      items.push({
        type: 'stat',
        title: 'Weak Linear Fit',
        description: `Only ${r2Pct}% of sales variance is explained by discounts. Non-linear factors or external business dynamics dominate daily sales.`,
        badge: `R² = ${r2Pct}%`
      });
    }
  }

  // Eigenvalue principal component insight
  if (eigen.isCalculable && eigen.totalVariance > 0) {
    const evr1Pct = (eigen.evr1 * 100).toFixed(1);
    items.push({
      type: 'stat',
      title: 'Principal Direction of Variation',
      description: `The dominant eigenvector explains ${evr1Pct}% of the 2D variance in the [Discount, Units] space. The joint data cloud aligns predominantly along the direction vector [${eigen.vector1.x.toFixed(3)}, ${eigen.vector1.y.toFixed(3)}].`,
      badge: `${evr1Pct}% Explained`
    });
  }

  // Correlation caution
  if (correlation.isCalculable) {
    items.push({
      type: 'recommendation',
      title: 'Association vs. Causation Caution',
      description: `Pearson's r is ${correlation.r.toFixed(3)}. While discounts and sales move together linearly, this observational data does not prove that discounts alone cause customer purchases. Always verify profit margins after discounts are factored in.`,
      badge: 'Actionable Guidance'
    });
  }

  return items;
}
