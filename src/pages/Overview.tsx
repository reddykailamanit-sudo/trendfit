import React from 'react';
import { CleanSalesRecord, DatasetState } from '../types/sales';
import { OverallAnalysis } from '../types/analysis';
import { MetricCard } from '../components/layout/MetricCard';
import { DailySalesChart } from '../components/charts/DailySalesChart';
import { ScatterEigenplot } from '../components/charts/ScatterEigenplot';
import { DiscountDistributionChart } from '../components/charts/DiscountDistributionChart';
import {
  FileSpreadsheet,
  Package,
  ShoppingCart,
  Percent,
  GitCommit,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Upload,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

interface OverviewProps {
  dataset: DatasetState;
  records: CleanSalesRecord[];
  analysis: OverallAnalysis;
  onOpenUpload: () => void;
  onLoadSample: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  dataset,
  records,
  analysis,
  onOpenUpload,
  onLoadSample,
  onNavigateToTab,
}) => {
  const { regression, correlation, eigen, insights } = analysis;

  const totalUnits = records.reduce((acc, r) => acc + r.units_sold, 0);
  const avgUnits = records.length > 0 ? (totalUnits / records.length).toFixed(1) : '0';
  const avgDiscount = records.length > 0
    ? (records.reduce((acc, r) => acc + r.discount_pct, 0) / records.length).toFixed(1)
    : '0';

  if (records.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
          <FileSpreadsheet className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Sales Records</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
          Import your store's daily discount and units sold CSV file or explore with our realistic preloaded sample dataset.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-200 transition-all"
          >
            <Upload className="h-4 w-4" />
            Upload Sales CSV
          </button>
          <button
            onClick={onLoadSample}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw className="h-4 w-4 text-slate-500" />
            Load Sample Dataset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Sales Pattern &amp; Curve Fitting Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time statistical synthesis of discount elasticity, correlation, and covariance variation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('predictions')}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Test Predictions
          </button>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <MetricCard
          title="Valid Records"
          value={records.length}
          subtitle={`${dataset.summary.invalidRowsCount} excluded`}
          icon={<FileSpreadsheet className="h-4 w-4 text-indigo-600" />}
          tooltip="Total number of cleaned, validated daily retail observations utilized in active mathematical modeling."
          badge={{ text: 'Verified', variant: 'positive' }}
        />

        <MetricCard
          title="Total Units Sold"
          value={totalUnits.toLocaleString()}
          subtitle="Cumulative sales"
          icon={<Package className="h-4 w-4 text-emerald-600" />}
          tooltip="Sum of all units sold across valid observation dates."
        />

        <MetricCard
          title="Daily Average"
          value={avgUnits}
          subtitle="Units / day (ȳ)"
          icon={<ShoppingCart className="h-4 w-4 text-blue-600" />}
          tooltip="Sample mean units sold per calendar day: ȳ = (1/n) Σ y_i."
        />

        <MetricCard
          title="Avg Discount"
          value={`${avgDiscount}%`}
          subtitle="Mean promo (x̄)"
          icon={<Percent className="h-4 w-4 text-amber-600" />}
          tooltip="Sample mean discount percentage applied: x̄ = (1/n) Σ x_i."
        />

        <MetricCard
          title="Correlation (r)"
          value={correlation.isCalculable ? correlation.r.toFixed(3) : 'N/A'}
          subtitle={correlation.isCalculable ? `${correlation.strength} ${correlation.direction}` : 'Undefined'}
          icon={<GitCommit className="h-4 w-4 text-rose-600" />}
          tooltip="Pearson product-moment correlation coefficient r measuring linear association [-1, +1]."
          badge={
            correlation.isCalculable
              ? {
                  text: correlation.strength.toUpperCase(),
                  variant: correlation.strength === 'strong' ? 'positive' : 'indigo',
                }
              : undefined
          }
        />

        <MetricCard
          title="Model R² Score"
          value={regression.isCalculable ? `${(regression.rSquared * 100).toFixed(1)}%` : 'N/A'}
          subtitle={regression.isCalculable ? `RMSE: ±${regression.rmse.toFixed(1)}` : 'Undefined'}
          icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
          tooltip="Coefficient of determination R² = 1 - (SSE/SST), representing proportion of sales variance explained by discounts."
          badge={
            regression.isCalculable && regression.rSquared >= 0.7
              ? { text: 'HIGH FIT', variant: 'positive' }
              : undefined
          }
        />
      </div>

      {/* Primary Chart: Scatter & Eigenplot */}
      <div>
        <ScatterEigenplot
          records={records}
          analysis={analysis}
          onSelectRecord={(r) => console.log('Selected record', r)}
        />
      </div>

      {/* Secondary Charts: Daily Timeline & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailySalesChart records={records} />
        <DiscountDistributionChart records={records} />
      </div>

      {/* Dynamic Insights & Executive Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Automated Business &amp; Mathematical Insights
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Derived from N={records.length} records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {insight.title}
                  </h4>
                  {insight.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100/80 text-indigo-700">
                      {insight.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* What this means for the shop owner */}
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-indigo-50/70 to-blue-50/40 border border-indigo-100 text-xs leading-relaxed text-slate-700">
          <span className="font-bold text-indigo-900 block mb-1">
            Summary for the Retail Shop Owner:
          </span>
          {regression.isCalculable && regression.slope > 0 ? (
            <p>
              Your customers demonstrate positive price sensitivity. Applying promotional discounts is consistently associated with higher sales volumes (approx. +{regression.slope.toFixed(1)} units per 5% discount). However, because correlation does not imply causation, ensure gross profit margins exceed the margin sacrificed per unit.
            </p>
          ) : (
            <p>
              Discount levels do not show a strong linear boost in volume. Re-evaluate customer demand elasticity before committing to aggressive markdowns.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
