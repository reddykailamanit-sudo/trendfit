import React, { useState } from 'react';
import { CleanSalesRecord } from '../types/sales';
import { OverallAnalysis } from '../types/analysis';
import { ScatterEigenplot } from '../components/charts/ScatterEigenplot';
import { MetricCard } from '../components/layout/MetricCard';
import {
  GitCommit,
  Calculator,
  HelpCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  TrendingUp,
  Sliders,
} from 'lucide-react';

interface RegressionAnalysisProps {
  records: CleanSalesRecord[];
  analysis: OverallAnalysis;
}

export const RegressionAnalysis: React.FC<RegressionAnalysisProps> = ({
  records,
  analysis,
}) => {
  const [showWorkedExample, setShowWorkedExample] = useState(true);
  const { regression, correlation } = analysis;

  if (!regression.isCalculable) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-2xl mx-auto my-12">
        <AlertTriangle className="h-10 w-10 text-amber-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-amber-900 mb-1">Regression Model Undefined</h3>
        <p className="text-sm text-amber-800 mb-4">{regression.uncalculableReason}</p>
        <p className="text-xs text-amber-700">
          At least two valid observations with differing discount percentages are required to compute the slope and intercept.
        </p>
      </div>
    );
  }

  // Correlation gauge position: maps [-1, 1] to [0%, 100%]
  const gaugePercent = Math.max(0, Math.min(100, ((correlation.r + 1) / 2) * 100));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Least-Squares Regression &amp; Correlation Analysis
          </h1>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
            Syllabus Unit V
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Mathematical curve fitting: minimize sum of squared vertical residuals to find optimal linear parameters.
        </p>
      </div>

      {/* Model Equation Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-lg border border-indigo-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
            Fitted Least-Squares Regression Model
          </span>
          <div className="text-2xl sm:text-4xl font-extrabold font-mono mt-1 text-white tracking-tight">
            {regression.equation}
          </div>
          <p className="text-xs text-indigo-200/80 mt-1">
            Where <strong>x</strong> is Discount Percentage (%) and <strong>ŷ</strong> is Predicted Units Sold.
          </p>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-indigo-800/60 pt-4 md:pt-0 md:pl-6 text-xs font-mono">
          <div>
            <div className="text-indigo-300 text-[11px] font-sans">Slope (b)</div>
            <div className="text-xl font-bold text-emerald-400">
              {regression.slope >= 0 ? '+' : ''}{regression.slope.toFixed(4)}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">units / 1% discount</div>
          </div>
          <div>
            <div className="text-indigo-300 text-[11px] font-sans">Intercept (a)</div>
            <div className="text-xl font-bold text-sky-400">
              {regression.intercept.toFixed(4)}
            </div>
            <div className="text-[10px] text-slate-400 font-sans">baseline units @ 0%</div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Pearson Correlation (r)"
          value={correlation.r.toFixed(4)}
          subtitle={`${correlation.strength} ${correlation.direction}`}
          tooltip="Pearson r = SSxy / sqrt(SSxx * SSyy). Standardized measure of linear co-movement bounded in [-1, +1]."
          badge={{ text: correlation.direction.toUpperCase(), variant: 'positive' }}
        />

        <MetricCard
          title="Coefficient of Determination (R²)"
          value={`${(regression.rSquared * 100).toFixed(1)}%`}
          subtitle={`SSR / SST = ${(regression.ssr / regression.sst).toFixed(3)}`}
          tooltip="Proportion of variance in units sold predictable from the discount percentage."
          badge={{ text: 'VARIANCE', variant: 'indigo' }}
        />

        <MetricCard
          title="Sum of Squared Errors (SSE)"
          value={regression.sse.toFixed(1)}
          subtitle="Residual variance"
          tooltip="SSE = Σ (y_i - ŷ_i)². Sum of squared vertical deviations minimized by least squares."
        />

        <MetricCard
          title="Root Mean Sq Error (RMSE)"
          value={`±${regression.rmse.toFixed(2)}`}
          subtitle="Average spread in units"
          tooltip="RMSE = sqrt(SSE / n). Standard deviation of the residuals."
        />
      </div>

      {/* Visual Correlation Scale */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">
              Pearson Correlation Scale
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              r = {correlation.r.toFixed(4)}
            </span>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            {correlation.strength.toUpperCase()} {correlation.direction.toUpperCase()}
          </span>
        </div>

        {/* Gradient bar with needle */}
        <div className="relative mt-4 mb-6">
          <div className="h-3 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 to-indigo-600 shadow-inner" />
          {/* Needle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-6 bg-slate-900 border-2 border-white rounded shadow-md transition-all duration-300"
            style={{ left: `${gaugePercent}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>-1.0 (Perfect Negative)</span>
          <span>-0.7</span>
          <span>-0.3</span>
          <span className="font-bold text-slate-700">0.0 (No Linear Link)</span>
          <span>+0.3</span>
          <span>+0.7</span>
          <span>+1.0 (Perfect Positive)</span>
        </div>

        <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <strong>Plain-Language Interpretation:</strong> {correlation.interpretation}
        </p>
      </div>

      {/* Interactive Regression Scatterplot */}
      <ScatterEigenplot
        records={records}
        analysis={analysis}
      />

      {/* Step-by-Step Worked Example (Viva & Educational Display) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                How the Least-Squares Line Was Derived
              </h3>
              <p className="text-xs text-slate-500">
                Exact mathematical step-by-step substitution using the current dataset
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWorkedExample(p => !p)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            {showWorkedExample ? 'Collapse Steps' : 'Show Full Steps'}
          </button>
        </div>

        {showWorkedExample && (
          <div className="space-y-4 text-xs font-mono text-slate-700">
            {/* Step 1: Means */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-sans font-bold text-slate-900 block mb-1">
                Step 1: Compute Sample Means (x̄ and ȳ)
              </span>
              <p className="text-slate-600 font-sans mb-1 text-[11px]">
                n = {records.length} valid observations.
              </p>
              <div>x̄ = (Σ xᵢ) / n = {regression.steps.sumX.toFixed(2)} / {regression.n} = <strong>{regression.meanDiscount.toFixed(4)}%</strong></div>
              <div>ȳ = (Σ yᵢ) / n = {regression.steps.sumY.toFixed(2)} / {regression.n} = <strong>{regression.meanUnits.toFixed(4)} units</strong></div>
            </div>

            {/* Step 2: Sums of Squares */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-sans font-bold text-slate-900 block mb-1">
                Step 2: Calculate Deviations and Sums of Squares (SSxx &amp; SSxy)
              </span>
              <div>SSxx = Σ (xᵢ − x̄)² = <strong>{regression.steps.ssxx.toFixed(4)}</strong></div>
              <div>SSyy = Σ (yᵢ − ȳ)² = <strong>{regression.steps.ssyy.toFixed(4)}</strong> (Total Sum of Squares SST)</div>
              <div>SSxy = Σ (xᵢ − x̄)(yᵢ − ȳ) = <strong>{regression.steps.ssxy.toFixed(4)}</strong></div>
            </div>

            {/* Step 3: Slope & Intercept */}
            <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <span className="font-sans font-bold text-indigo-950 block mb-1">
                Step 3: Solve for Optimal Slope (b) and Intercept (a)
              </span>
              <div>b = SSxy / SSxx = {regression.steps.ssxy.toFixed(4)} / {regression.steps.ssxx.toFixed(4)} = <strong className="text-indigo-700">{regression.slope.toFixed(4)}</strong></div>
              <div className="mt-1">a = ȳ − b · x̄ = {regression.meanUnits.toFixed(4)} − ({regression.slope.toFixed(4)} × {regression.meanDiscount.toFixed(4)}) = <strong className="text-indigo-700">{regression.intercept.toFixed(4)}</strong></div>
              <div className="mt-2 text-indigo-900 font-bold">
                Final Equation: ŷ = {regression.intercept.toFixed(4)} {regression.slope >= 0 ? '+' : '-'} {Math.abs(regression.slope).toFixed(4)}x
              </div>
            </div>

            {/* Step 4: Pearson correlation */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-sans font-bold text-slate-900 block mb-1">
                Step 4: Pearson Correlation (r) &amp; Goodness of Fit (R²)
              </span>
              <div>r = SSxy / √(SSxx × SSyy) = {regression.steps.ssxy.toFixed(3)} / √({regression.steps.ssxx.toFixed(2)} × {regression.steps.ssyy.toFixed(2)}) = <strong>{correlation.r.toFixed(4)}</strong></div>
              <div className="mt-1">R² = 1 − (SSE / SST) = 1 − ({regression.sse.toFixed(2)} / {regression.sst.toFixed(2)}) = <strong>{(regression.rSquared * 100).toFixed(2)}%</strong></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
