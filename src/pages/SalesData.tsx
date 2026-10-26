import React, { useState, useMemo } from 'react';
import { CleanSalesRecord, DatasetState } from '../types/sales';
import { OverallAnalysis } from '../types/analysis';
import { exportCleanedDataCSV, exportPredictionsCSV } from '../lib/exportUtils';
import {
  Search,
  ArrowUpDown,
  Download,
  Filter,
  CheckCircle2,
  Trash2,
  EyeOff,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';

interface SalesDataProps {
  dataset: DatasetState;
  records: CleanSalesRecord[];
  analysis: OverallAnalysis;
  onToggleExclude: (index: number) => void;
  onRemovePermanently: (index: number) => void;
}

export const SalesData: React.FC<SalesDataProps> = ({
  dataset,
  records,
  analysis,
  onToggleExclude,
  onRemovePermanently,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'date' | 'discount_pct' | 'units_sold' | 'residual'>('date');
  const [sortAsc, setSortAsc] = useState(true);
  const [minDiscountFilter, setMinDiscountFilter] = useState<number>(0);
  const [maxDiscountFilter, setMaxDiscountFilter] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Filtered & Sorted Records
  const processedRecords = useMemo(() => {
    let result = dataset.cleanedData.map((rec, originalIndex) => ({
      ...rec,
      originalIndex,
      isExcluded: dataset.excludedRowIndices.has(originalIndex),
    }));

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        r =>
          r.date.toLowerCase().includes(term) ||
          r.discount_pct.toString().includes(term) ||
          r.units_sold.toString().includes(term)
      );
    }

    // Discount range filter
    result = result.filter(
      r => r.discount_pct >= minDiscountFilter && r.discount_pct <= maxDiscountFilter
    );

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = valA ?? 0;
        valB = valB ?? 0;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    dataset.cleanedData,
    dataset.excludedRowIndices,
    searchTerm,
    minDiscountFilter,
    maxDiscountFilter,
    sortField,
    sortAsc,
  ]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(processedRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedRecords.slice(start, start + pageSize);
  }, [processedRecords, currentPage, pageSize]);

  const handleSort = (field: 'date' | 'discount_pct' | 'units_sold' | 'residual') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Sales Dataset &amp; Residuals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Search, sort, filter, and inspect observed vs. regression-modeled daily sales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCleanedDataCSV(records, `${dataset.name}_cleaned.csv`)}
            disabled={records.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Export Cleaned CSV
          </button>

          <button
            onClick={() => exportPredictionsCSV(records, `${dataset.name}_predictions.csv`)}
            disabled={records.length === 0 || !analysis.regression.isCalculable}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-200 transition-all disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export Predictions CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search date, discount, units..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Discount range filter */}
          <div className="flex items-center gap-2 text-xs text-slate-600 w-full md:w-auto">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-indigo-600" />
              Discount Range:
            </span>
            <input
              type="number"
              min="0"
              max="100"
              value={minDiscountFilter}
              onChange={(e) => setMinDiscountFilter(Number(e.target.value))}
              className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono"
            />
            <span>% to</span>
            <input
              type="number"
              min="0"
              max="100"
              value={maxDiscountFilter}
              onChange={(e) => setMaxDiscountFilter(Number(e.target.value))}
              className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono"
            />
            <span>%</span>
          </div>

          {/* Row count pill */}
          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{processedRecords.length}</strong> of{' '}
            <strong className="text-slate-900">{dataset.cleanedData.length}</strong> total imported
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-12 text-center">Status</th>
                <th
                  onClick={() => handleSort('date')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('discount_pct')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Discount (%)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('units_sold')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Observed Units</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">
                  Predicted ŷ (Model)
                </th>
                <th
                  onClick={() => handleSort('residual')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Residual (e = y - ŷ)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const isSelected = selectedRecordId === r.id;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRecordId(isSelected ? null : r.id)}
                      className={`cursor-pointer transition-colors ${
                        r.isExcluded
                          ? 'bg-slate-50/80 text-slate-400 opacity-60'
                          : isSelected
                          ? 'bg-indigo-50/70 text-slate-900'
                          : 'hover:bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      {/* Status indicator */}
                      <td className="py-3 px-4 text-center font-sans">
                        {r.isExcluded ? (
                          <span
                            title="Row excluded from active mathematical calculations"
                            className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600"
                          >
                            Excluded
                          </span>
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 inline-block" />
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 font-sans font-medium text-slate-900">
                        {r.date}
                      </td>

                      {/* Discount % */}
                      <td className="py-3 px-4 text-right text-indigo-700 font-semibold">
                        {r.discount_pct}%
                      </td>

                      {/* Units Sold */}
                      <td className="py-3 px-4 text-right text-slate-900 font-bold">
                        {r.units_sold}
                      </td>

                      {/* Predicted units */}
                      <td className="py-3 px-4 text-right text-sky-700">
                        {r.predicted_units !== undefined ? r.predicted_units.toFixed(2) : '-'}
                      </td>

                      {/* Residual */}
                      <td className="py-3 px-4 text-right">
                        {r.residual !== undefined ? (
                          <span
                            className={`font-semibold ${
                              Math.abs(r.residual) < 0.05
                                ? 'text-slate-400'
                                : r.residual > 0
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {r.residual >= 0 ? `+${r.residual.toFixed(2)}` : r.residual.toFixed(2)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-center font-sans" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onToggleExclude(r.originalIndex)}
                            title={r.isExcluded ? 'Include this record in analysis' : 'Exclude from calculations'}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                          >
                            {r.isExcluded ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => onRemovePermanently(r.originalIndex)}
                            title="Remove observation row"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
