import React, { useState, useMemo } from 'react';
import { CleanSalesRecord } from '../types/sales';
import { OverallAnalysis } from '../types/analysis';
import { predictUnitsSold, generateScenarioPredictions, PredictionResult } from '../lib/predictions';
import { ScatterEigenplot } from '../components/charts/ScatterEigenplot';
import {
  Sparkles,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface PredictionsProps {
  records: CleanSalesRecord[];
  analysis: OverallAnalysis;
}

export const Predictions: React.FC<PredictionsProps> = ({
  records,
  analysis,
}) => {
  const [selectedDiscount, setSelectedDiscount] = useState<number>(15);
  const [unitPrice, setUnitPrice] = useState<number>(50); // Optional unit price in $
  const [customScenarios, setCustomScenarios] = useState<number[]>([5, 10, 15, 20, 25, 30, 40]);
  const [newScenarioInput, setNewScenarioInput] = useState<string>('');

  const { regression } = analysis;

  const currentPrediction = useMemo<PredictionResult | null>(() => {
    return predictUnitsSold(selectedDiscount, regression);
  }, [selectedDiscount, regression]);

  const scenarioPredictions = useMemo<PredictionResult[]>(() => {
    return generateScenarioPredictions(customScenarios, regression);
  }, [customScenarios, regression]);

  if (!regression.isCalculable) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-2xl mx-auto my-12">
        <AlertTriangle className="h-10 w-10 text-amber-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-amber-900 mb-1">Predictions Unavailable</h3>
        <p className="text-sm text-amber-800 mb-4">{regression.uncalculableReason}</p>
        <p className="text-xs text-amber-700">
          Load or import a valid sales dataset with varying discount percentages to fit the predictive regression model.
        </p>
      </div>
    );
  }

  const handleAddScenario = () => {
    const val = Number(newScenarioInput);
    if (!isNaN(val) && val >= 0 && val <= 100 && !customScenarios.includes(val)) {
      setCustomScenarios(prev => [...prev, val].sort((a, b) => a - b));
      setNewScenarioInput('');
    }
  };

  const handleRemoveScenario = (val: number) => {
    setCustomScenarios(prev => prev.filter(s => s !== val));
  };

  // Prediction point for scatterplot highlight
  const predictionPoint = currentPrediction
    ? { discount: currentPrediction.discountPct, units: currentPrediction.predictedUnits }
    : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Sales Prediction &amp; Scenario Simulator
          </h1>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
            Interactive Model
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Estimate expected daily sales units for any discount percentage using the fitted least-squares line.
        </p>
      </div>

      {/* Main Interactive Predictor Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sliders className="h-4 w-4 text-indigo-600" />
                Select Promotional Discount
              </h3>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                {selectedDiscount}%
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="60"
                step="1"
                value={selectedDiscount}
                onChange={(e) => setSelectedDiscount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>0% (No promo)</span>
                <span>Observed Range: {regression.minObservedDiscount}% – {regression.maxObservedDiscount}%</span>
                <span>60%</span>
              </div>
            </div>

            {/* Direct Number Input */}
            <div className="mt-5 flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-600">
                Direct Input (%):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={selectedDiscount}
                onChange={(e) => setSelectedDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-24 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono text-center font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Unit Price Input for Revenue Projection */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1 font-medium">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                Base Retail Price / Unit ($):
              </span>
              <input
                type="number"
                min="1"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(1, Number(e.target.value)))}
                className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono font-medium"
              />
            </div>
          </div>

          {/* Extrapolation Warning */}
          {currentPrediction?.isExtrapolation && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                Extrapolation Notice
              </div>
              <p className="text-[11px] leading-relaxed">
                {currentPrediction.extrapolationReason} Linear models assume trends continue indefinitely, which rarely holds true at extreme discounts.
              </p>
            </div>
          )}

          {/* Model Formula Used */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
            <div>Model: ŷ = {regression.equation.replace('ŷ = ', '')}</div>
            <div>Calculation: {regression.intercept.toFixed(2)} + ({regression.slope.toFixed(2)} × {selectedDiscount}) = <strong>{currentPrediction?.unroundedPredictedUnits.toFixed(2)}</strong></div>
          </div>
        </div>

        {/* Prediction Output Column */}
        <div className="lg:col-span-7 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Forecasted Sales Volume
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                @ {selectedDiscount}% Discount
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-5xl sm:text-7xl font-extrabold font-mono tracking-tight text-white">
                {currentPrediction?.predictedUnits}
              </span>
              <span className="text-xl sm:text-2xl font-medium text-indigo-200">
                units / day
              </span>
            </div>

            <p className="text-xs text-indigo-200/80 mt-1 font-mono">
              Unrounded estimate: {currentPrediction?.unroundedPredictedUnits.toFixed(2)} units
            </p>

            {/* Comparison against mean */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-indigo-800/60">
              <div>
                <span className="text-xs text-indigo-300 font-sans block">
                  Vs. Daily Average (ȳ={regression.meanUnits.toFixed(1)})
                </span>
                <span className={`text-xl font-bold font-mono mt-1 block ${
                  (currentPrediction?.diffFromMean ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {(currentPrediction?.diffFromMean ?? 0) >= 0 ? '+' : ''}
                  {currentPrediction?.diffFromMean.toFixed(1)} units (
                  {(currentPrediction?.pctDiffFromMean ?? 0) >= 0 ? '+' : ''}
                  {currentPrediction?.pctDiffFromMean.toFixed(1)}%)
                </span>
              </div>

              <div>
                <span className="text-xs text-indigo-300 font-sans block">
                  Estimated Gross Revenue
                </span>
                <span className="text-xl font-bold font-mono mt-1 text-emerald-400 block">
                  ${(
                    (currentPrediction?.predictedUnits ?? 0) *
                    (unitPrice * (1 - selectedDiscount / 100))
                  ).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  @ ${(unitPrice * (1 - selectedDiscount / 100)).toFixed(2)} discounted price
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-indigo-800/40 text-[11px] text-indigo-200/70">
            Least-squares predictive estimator minimizes expected squared deviation: E[(y − ŷ)²] = RMSE² = {regression.sse.toFixed(1)} / {regression.n}.
          </div>
        </div>
      </div>

      {/* Visual Placement on Scatterplot */}
      <ScatterEigenplot
        records={records}
        analysis={analysis}
        predictionPoint={predictionPoint}
      />

      {/* Multi-Discount Scenario Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Promotional Scenario Comparison Table
            </h3>
            <p className="text-xs text-slate-500">
              Compare forecasted sales, unit pricing, and revenue across multiple discount tiers
            </p>
          </div>

          {/* Add custom scenario input */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 35%"
              value={newScenarioInput}
              onChange={(e) => setNewScenarioInput(e.target.value)}
              className="w-20 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-center font-mono"
            />
            <button
              onClick={handleAddScenario}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Tier
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-sans font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Discount Tier</th>
                <th className="py-2.5 px-3 text-right">Effective Unit Price</th>
                <th className="py-2.5 px-3 text-right">Predicted Units</th>
                <th className="py-2.5 px-3 text-right">Vs. Avg (ȳ={regression.meanUnits.toFixed(1)})</th>
                <th className="py-2.5 px-3 text-right">Gross Revenue</th>
                <th className="py-2.5 px-3 text-center">Extrapolation?</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scenarioPredictions.map((sc) => {
                const effectivePrice = unitPrice * (1 - sc.discountPct / 100);
                const revenue = sc.predictedUnits * effectivePrice;
                return (
                  <tr
                    key={sc.discountPct}
                    className={`hover:bg-slate-50/60 ${
                      selectedDiscount === sc.discountPct ? 'bg-indigo-50/50 font-bold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-indigo-700 font-bold">
                      {sc.discountPct}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">
                      ${effectivePrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-900 font-bold">
                      {sc.predictedUnits} units
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={sc.diffFromMean >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {sc.diffFromMean >= 0 ? '+' : ''}{sc.diffFromMean.toFixed(1)} ({sc.pctDiffFromMean.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">
                      ${revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      {sc.isExtrapolation ? (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Extrapolated
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          In-Range
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleRemoveScenario(sc.discountPct)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove tier"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
