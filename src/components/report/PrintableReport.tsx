import React from 'react';
import { CleanSalesRecord, DatasetState } from '../../types/sales';
import { OverallAnalysis } from '../../types/analysis';
import { Printer, X } from 'lucide-react';

interface PrintableReportProps {
  dataset: DatasetState;
  records: CleanSalesRecord[];
  analysis: OverallAnalysis;
  onClose: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  dataset,
  records,
  analysis,
  onClose,
}) => {
  const { regression, correlation, covariance, eigen } = analysis;
  const [[varD, covDS], [, varS]] = covariance.matrix;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 flex justify-center">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-8 shadow-2xl my-auto text-slate-900 border border-slate-200">
        {/* Controls - hidden on print */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 no-print">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Printable Executive Report Preview</h2>
            <p className="text-xs text-slate-500">Formatted for print, PDF export, or viva documentation</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-6 text-xs text-slate-700">
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-4 border-slate-200">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">TrendFit — Statistical Analysis Report</h1>
              <p className="text-xs text-slate-500 mt-1">
                Sales Pattern, Least-Squares Curve Fitting &amp; Covariance Eigen-Analysis
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-400 font-mono">
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div>Dataset: {dataset.name}</div>
              <div>Valid Observations: {records.length}</div>
            </div>
          </div>

          {/* Section 1: Overview KPIs */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
              1. Key Performance &amp; Association Metrics
            </h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 border rounded-xl">
                <div className="text-slate-500 text-[10px]">Pearson Correlation (r)</div>
                <div className="text-base font-bold text-indigo-700 font-mono mt-0.5">
                  {correlation.isCalculable ? correlation.r.toFixed(4) : 'N/A'}
                </div>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <div className="text-slate-500 text-[10px]">Goodness of Fit (R²)</div>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {regression.isCalculable ? `${(regression.rSquared * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <div className="text-slate-500 text-[10px]">Fitted Slope (b)</div>
                <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">
                  {regression.isCalculable ? `${regression.slope >= 0 ? '+' : ''}${regression.slope.toFixed(4)}` : 'N/A'}
                </div>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <div className="text-slate-500 text-[10px]">Residual Spread (RMSE)</div>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {regression.isCalculable ? `±${regression.rmse.toFixed(2)}` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Unit V Linear Regression */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
              2. Unit V — Least-Squares Regression Model
            </h3>
            <div className="p-4 bg-slate-50 border rounded-xl space-y-1 font-mono text-[11px]">
              <div>Model: <strong>{regression.equation}</strong></div>
              <div>Slope: b = SSxy / SSxx = {regression.steps.ssxy.toFixed(3)} / {regression.steps.ssxx.toFixed(3)} = {regression.slope.toFixed(4)}</div>
              <div>Intercept: a = ȳ − bx̄ = {regression.meanUnits.toFixed(3)} − ({regression.slope.toFixed(3)} × {regression.meanDiscount.toFixed(3)}) = {regression.intercept.toFixed(4)}</div>
              <div>Sum of Squared Errors (SSE): {regression.sse.toFixed(2)} | Total Sum of Squares (SST): {regression.sst.toFixed(2)}</div>
            </div>
          </div>

          {/* Section 3: Unit I Covariance & Eigenvalues */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
              3. Unit I — Covariance Matrix &amp; Eigen-Analysis
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border rounded-xl font-mono text-[11px]">
                <div className="font-bold font-sans text-slate-800 mb-1">Covariance Matrix C (N - 1):</div>
                <div>[ {varD.toFixed(3)},  {covDS.toFixed(3)} ]</div>
                <div>[ {covDS.toFixed(3)},  {varS.toFixed(3)} ]</div>
                <div className="text-[10px] text-slate-500 font-sans mt-2">
                  Trace = { (varD + varS).toFixed(3) } | Det = { (varD * varS - covDS * covDS).toFixed(3) }
                </div>
              </div>

              <div className="p-4 bg-slate-50 border rounded-xl font-mono text-[11px] space-y-1">
                <div>λ₁ = {eigen.lambda1.toFixed(4)} ({(eigen.evr1 * 100).toFixed(1)}% EVR)</div>
                <div>v₁ = [ {eigen.vector1.x.toFixed(4)}, {eigen.vector1.y.toFixed(4)} ]ᵀ</div>
                <div className="pt-1">λ₂ = {eigen.lambda2.toFixed(4)} ({(eigen.evr2 * 100).toFixed(1)}% EVR)</div>
                <div>v₂ = [ {eigen.vector2.x.toFixed(4)}, {eigen.vector2.y.toFixed(4)} ]ᵀ</div>
              </div>
            </div>
          </div>

          {/* Section 4: First 15 Records Table */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
              4. Dataset Observations &amp; Residuals
            </h3>
            <div className="border rounded-xl overflow-hidden text-[10px] font-mono">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2 text-right">Discount</th>
                    <th className="p-2 text-right">Observed Units</th>
                    <th className="p-2 text-right">Predicted (ŷ)</th>
                    <th className="p-2 text-right">Residual (e)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {records.slice(0, 15).map(r => (
                    <tr key={r.id}>
                      <td className="p-2">{r.date}</td>
                      <td className="p-2 text-right">{r.discount_pct}%</td>
                      <td className="p-2 text-right font-bold">{r.units_sold}</td>
                      <td className="p-2 text-right">{r.predicted_units?.toFixed(2) ?? '-'}</td>
                      <td className="p-2 text-right">{r.residual !== undefined ? `${r.residual >= 0 ? '+' : ''}${r.residual.toFixed(2)}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Report Footer */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between">
            <span>TrendFit Curve Fitting &amp; Mathematical Pattern Analyzer</span>
            <span>Generated locally via Antigravity</span>
          </div>
        </div>
      </div>
    </div>
  );
};
