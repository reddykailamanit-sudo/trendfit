import React, { useMemo } from 'react';
import { CleanSalesRecord } from '../types/sales';
import { OverallAnalysis } from '../types/analysis';
import { DailySalesChart } from '../components/charts/DailySalesChart';
import { DiscountDistributionChart } from '../components/charts/DiscountDistributionChart';
import {
  TrendingUp,
  Calendar,
  Zap,
  BarChart2,
  Percent,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface TrendAnalysisProps {
  records: CleanSalesRecord[];
  analysis: OverallAnalysis;
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ records, analysis }) => {
  // Day of week sales analysis
  const dayOfWeekData = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const buckets = days.map(d => ({ day: d, totalUnits: 0, count: 0, avgUnits: 0 }));

    records.forEach(r => {
      const d = new Date(r.date);
      if (!isNaN(d.getTime())) {
        const dayIdx = d.getDay();
        buckets[dayIdx].totalUnits += r.units_sold;
        buckets[dayIdx].count++;
      }
    });

    return buckets
      .filter(b => b.count > 0)
      .map(b => ({
        day: b.day,
        avgUnits: Number((b.totalUnits / b.count).toFixed(1)),
        count: b.count,
      }));
  }, [records]);

  // High discount vs low discount sales comparison
  const discountTierComparison = useMemo(() => {
    if (records.length === 0) return { lowAvg: 0, highAvg: 0, medianDiscount: 0 };
    const discounts = records.map(r => r.discount_pct).sort((a, b) => a - b);
    const medianDiscount = discounts[Math.floor(discounts.length / 2)];

    const lowTier = records.filter(r => r.discount_pct <= medianDiscount);
    const highTier = records.filter(r => r.discount_pct > medianDiscount);

    const lowAvg = lowTier.length > 0
      ? lowTier.reduce((acc, r) => acc + r.units_sold, 0) / lowTier.length
      : 0;

    const highAvg = highTier.length > 0
      ? highTier.reduce((acc, r) => acc + r.units_sold, 0) / highTier.length
      : 0;

    return {
      medianDiscount,
      lowAvg: Number(lowAvg.toFixed(1)),
      highAvg: Number(highAvg.toFixed(1)),
      lowCount: lowTier.length,
      highCount: highTier.length,
    };
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Sales Trend &amp; Temporal Dynamics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Analyze sales timeline patterns, moving averages, and promotional volume response across days.
        </p>
      </div>

      {/* Main Timeline Chart */}
      <DailySalesChart records={records} />

      {/* Grid: Day of week breakdown & Discount tier comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day of Week Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-600" />
              Day-of-Week Average Sales
            </h3>
            <p className="text-xs text-slate-500">
              Average units sold on each calendar day of the week
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl font-mono">
                          <div className="font-sans font-bold text-slate-200 mb-1">{data.day}</div>
                          <div>Avg Units: <span className="text-emerald-400 font-bold">{data.avgUnits}</span></div>
                          <div>Days Observed: <span className="text-indigo-300">{data.count}</span></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avgUnits" fill="#6366f1" radius={[4, 4, 0, 0]} name="Avg Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Median Split Comparison */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Promotion Tier Response (Median Split)
              </h3>
              <p className="text-xs text-slate-500">
                Comparing average daily sales between conservative vs. aggressive discount days
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500">
                  Low / Standard Promo
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  ≤ {discountTierComparison.medianDiscount}% discount ({discountTierComparison.lowCount} days)
                </div>
                <div className="text-2xl font-extrabold text-slate-800 font-mono mt-3">
                  {discountTierComparison.lowAvg}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">avg daily units sold</div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200">
                <div className="text-xs font-semibold text-indigo-700">
                  High Promo Tier
                </div>
                <div className="text-[11px] text-indigo-500 mt-0.5">
                  &gt; {discountTierComparison.medianDiscount}% discount ({discountTierComparison.highCount} days)
                </div>
                <div className="text-2xl font-extrabold text-indigo-900 font-mono mt-3">
                  {discountTierComparison.highAvg}
                </div>
                <div className="text-[11px] text-indigo-600 mt-1">avg daily units sold</div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Observed Delta:</span>
              <p>
                Days with aggressive discounts experienced an average of{' '}
                <strong className="text-indigo-600">
                  {discountTierComparison.highAvg >= discountTierComparison.lowAvg ? '+' : ''}
                  {(discountTierComparison.highAvg - discountTierComparison.lowAvg).toFixed(1)} units
                </strong>{' '}
                per day compared to conservative discount days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
