import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { CleanSalesRecord } from '../../types/sales';
import { Calendar, Filter } from 'lucide-react';

interface DailySalesChartProps {
  records: CleanSalesRecord[];
}

export const DailySalesChart: React.FC<DailySalesChartProps> = ({ records }) => {
  const [showMovingAverage, setShowMovingAverage] = useState(true);
  const [windowSize, setWindowSize] = useState<number>(3);

  // Sort chronologically
  const sortedData = useMemo(() => {
    return [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [records]);

  // Compute simple moving average (SMA)
  const chartData = useMemo(() => {
    return sortedData.map((item, idx) => {
      let sma: number | null = null;
      if (idx >= windowSize - 1) {
        let sum = 0;
        for (let i = 0; i < windowSize; i++) {
          sum += sortedData[idx - i].units_sold;
        }
        sma = Number((sum / windowSize).toFixed(2));
      }
      return {
        ...item,
        moving_avg: sma,
      };
    });
  }, [sortedData, windowSize]);

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center text-slate-400">
        No sales data available to chart.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-600" />
            Daily Sales Timeline &amp; Trend
          </h3>
          <p className="text-xs text-slate-500">
            Observed units sold over time with smooth moving average
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={showMovingAverage}
              onChange={(e) => setShowMovingAverage(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>{windowSize}-Day Moving Avg</span>
          </label>

          {showMovingAverage && (
            <select
              value={windowSize}
              onChange={(e) => setWindowSize(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value={2}>2-Day Window</option>
              <option value={3}>3-Day Window</option>
              <option value={5}>5-Day Window</option>
              <option value={7}>7-Day Window</option>
            </select>
          )}
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl font-mono">
                      <div className="font-sans font-bold text-slate-200 mb-1">{data.date}</div>
                      <div>Units Sold: <span className="text-emerald-400 font-bold">{data.units_sold}</span></div>
                      <div>Discount Applied: <span className="text-indigo-300 font-bold">{data.discount_pct}%</span></div>
                      {data.moving_avg !== null && (
                        <div>Moving Avg: <span className="text-amber-300">{data.moving_avg}</span></div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
            <Line
              type="monotone"
              dataKey="units_sold"
              name="Units Sold"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 1.5 }}
              activeDot={{ r: 6 }}
            />
            {showMovingAverage && (
              <Line
                type="monotone"
                dataKey="moving_avg"
                name={`${windowSize}-Day Moving Avg`}
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
