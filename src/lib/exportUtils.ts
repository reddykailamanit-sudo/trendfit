import { CleanSalesRecord } from '../types/sales';
import { OverallAnalysis } from '../types/analysis';

export function exportCleanedDataCSV(records: CleanSalesRecord[], filename = 'trendfit_cleaned_sales.csv'): void {
  const header = 'date,discount_pct,units_sold\n';
  const rows = records.map(r => `${r.date},${r.discount_pct},${r.units_sold}`).join('\n');
  downloadBlob(header + rows, filename, 'text/csv');
}

export function exportPredictionsCSV(records: CleanSalesRecord[], filename = 'trendfit_predictions_residuals.csv'): void {
  const header = 'date,discount_pct,units_sold,predicted_units,residual\n';
  const rows = records.map(r => {
    const pred = r.predicted_units !== undefined ? r.predicted_units.toFixed(2) : '';
    const res = r.residual !== undefined ? r.residual.toFixed(2) : '';
    return `${r.date},${r.discount_pct},${r.units_sold},${pred},${res}`;
  }).join('\n');
  downloadBlob(header + rows, filename, 'text/csv');
}

export function exportAnalysisReportHTML(
  datasetName: string,
  records: CleanSalesRecord[],
  analysis: OverallAnalysis,
  filename = 'trendfit_mathematical_report.html'
): void {
  const dateStr = new Date().toLocaleString();
  const { regression, correlation, covariance, eigen } = analysis;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TrendFit — Executive Mathematical & Sales Analysis Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 900px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #0f172a; border-bottom: 2px solid #4f46e5; padding-bottom: 8px; }
    h2 { color: #3730a3; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; color: #334155; }
    .matrix { display: inline-block; border-left: 2px solid #1e293b; border-right: 2px solid #1e293b; padding: 4px 12px; font-family: monospace; font-size: 1.1em; background: #f1f5f9; border-radius: 4px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.85em; font-weight: 600; background: #e0e7ff; color: #3730a3; }
    .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
    .card .val { font-size: 1.5em; font-weight: 700; color: #4338ca; margin-top: 4px; }
    .footer { margin-top: 40px; font-size: 0.85em; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>TrendFit — Mathematical & Sales Pattern Report</h1>
  <p><strong>Dataset:</strong> ${datasetName} | <strong>Generated:</strong> ${dateStr} | <strong>Observations (N):</strong> ${records.length}</p>

  <div class="metric-grid">
    <div class="card"><div>Pearson Correlation (r)</div><div class="val">${correlation.isCalculable ? correlation.r.toFixed(4) : 'N/A'}</div></div>
    <div class="card"><div>R² Goodness of Fit</div><div class="val">${regression.isCalculable ? (regression.rSquared * 100).toFixed(1) + '%' : 'N/A'}</div></div>
    <div class="card"><div>Fitted Slope (b)</div><div class="val">${regression.isCalculable ? regression.slope.toFixed(3) : 'N/A'}</div></div>
  </div>

  <h2>1. Least-Squares Linear Regression (Unit V)</h2>
  <p><strong>Equation:</strong> <code>${regression.equation}</code></p>
  <ul>
    <li>Slope (b): <strong>${regression.isCalculable ? regression.slope.toFixed(4) : 'N/A'}</strong> (units per 1% discount)</li>
    <li>Intercept (a): <strong>${regression.isCalculable ? regression.intercept.toFixed(4) : 'N/A'}</strong> units</li>
    <li>Sum of Squared Errors (SSE): ${regression.sse.toFixed(2)}</li>
    <li>Total Sum of Squares (SST): ${regression.sst.toFixed(2)}</li>
    <li>Root Mean Squared Error (RMSE): ${regression.rmse.toFixed(2)} units</li>
  </ul>

  <h2>2. Covariance Matrix & Eigenvalues (Unit I)</h2>
  <p>Sample 2×2 Covariance Matrix with denominator (N - 1):</p>
  <div class="matrix">
    [ ${covariance.matrix[0][0].toFixed(3)}, ${covariance.matrix[0][1].toFixed(3)} ]<br/>
    [ ${covariance.matrix[1][0].toFixed(3)}, ${covariance.matrix[1][1].toFixed(3)} ]
  </div>
  <ul>
    <li><strong>Dominant Eigenvalue (λ₁):</strong> ${eigen.isCalculable ? eigen.lambda1.toFixed(4) : 'N/A'} (Explained Variance: ${(eigen.evr1 * 100).toFixed(1)}%)</li>
    <li><strong>Normalized Eigenvector (v₁):</strong> [${eigen.vector1.x.toFixed(4)}, ${eigen.vector1.y.toFixed(4)}]ᵀ</li>
    <li><strong>Secondary Eigenvalue (λ₂):</strong> ${eigen.isCalculable ? eigen.lambda2.toFixed(4) : 'N/A'} (Explained Variance: ${(eigen.evr2 * 100).toFixed(1)}%)</li>
    <li><strong>Normalized Eigenvector (v₂):</strong> [${eigen.vector2.x.toFixed(4)}, ${eigen.vector2.y.toFixed(4)}]ᵀ</li>
  </ul>

  <h2>3. Dataset Records (First 20)</h2>
  <table>
    <thead><tr><th>Date</th><th>Discount (%)</th><th>Observed Units</th><th>Predicted Units</th><th>Residual</th></tr></thead>
    <tbody>
      ${records.slice(0, 20).map(r => `
        <tr>
          <td>${r.date}</td>
          <td>${r.discount_pct}%</td>
          <td>${r.units_sold}</td>
          <td>${r.predicted_units !== undefined ? r.predicted_units.toFixed(2) : '-'}</td>
          <td>${r.residual !== undefined ? r.residual.toFixed(2) : '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    TrendFit Curve Fitting & Mathematical Pattern Analyzer — College Project & Retail Analytics
  </div>
</body>
</html>`;

  downloadBlob(htmlContent, filename, 'text/html');
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
