import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { CleanSalesRecord } from '../../types/sales';
import { BarChart3 } from 'lucide-react';

interface DiscountDistributionChartProps {
  records: CleanSalesRecord[];
}

export const DiscountDistributionChart: React.FC<DiscountDistributionChartProps> = ({ records }) => {
  const distributionData = useMemo(() => {
    const bins = [
      { range: '0% – 5%', min: 0, max: 5, count: 0, totalUnits: 0 },
      { range: '6% – 10%', min: 6, max: 10, count: 0, totalUnits: 0 },
      { range: '11% – 15%', min: 11, max: 15, count: 0, totalUnits: 0 },
      { range: '16% – 20%', min: 16, max: 20, count: 0, totalUnits: 0 },
      { range: '21% – 25%', min: 21, max: 25, count: 0, totalUnits: 0 },
      { range: '26% – 30%', min: 26, max: 30, count: 0, totalUnits: 0 },
      { range: '> 30%', min: 31, max: 100, count: 0, totalUnits: 0 },
    ];

    records.forEach(r => {
      const bin = bins.find(b => r.discount_pct >= b.min && r.discount_pct <= b.max);
      if (bin) {
        bin.count++;
        bin.totalUnits += r.units_sold;
      }
    });

    return bins.map(b => ({
      range: b.range,
      frequency: b.count,
      avgUnits: b.count > 0 ? Number((b.totalUnits / b.count).toFixed(1)) : 0,
    }));
  }, [records]);

  const COLORS = ['#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81', '#242065', '#1e1b4b'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-600" />
          Discount Frequency Distribution
        </h3>
        <p className="text-xs text-slate-500">
          Frequency of promotional discount offerings across recorded days
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              allowDecimals={false}
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
                      <div className="font-sans font-bold text-slate-200 mb-1">{data.range}</div>
                      <div>Days Offered: <span className="text-indigo-400 font-bold">{data.frequency}</span></div>
                      <div>Avg Units Sold: <span className="text-emerald-400 font-bold">{data.avgUnits}</span></div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="frequency" name="Days Count" radius={[4, 4, 0, 0]}>
              {distributionData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
