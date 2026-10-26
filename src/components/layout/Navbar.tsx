import React from 'react';
import { TrendingUp, Upload, RefreshCw, RotateCcw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { DatasetState } from '../../types/sales';

interface NavbarProps {
  dataset: DatasetState;
  activeCount: number;
  onOpenUpload: () => void;
  onLoadSample: () => void;
  onReset: () => void;
  onPrintReport: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  dataset,
  activeCount,
  onOpenUpload,
  onLoadSample,
  onReset,
  onPrintReport,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 transition-colors no-print">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Branding & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">TrendFit</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-full">
                  v1.0 • Applied Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Discover the Pattern. Understand the Data. Predict the Trend.
              </p>
            </div>
          </div>
        </div>

        {/* Dataset Status Banner */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Dataset:</span>
            <span className="font-medium text-slate-800 max-w-[180px] truncate" title={dataset.name}>
              {dataset.name}
            </span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1">
            {activeCount > 0 ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-semibold text-emerald-700">{activeCount} valid rows</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-semibold text-amber-700">0 records</span>
              </>
            )}
          </div>
          {dataset.isSample && (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-medium">
              Demo Data
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Upload CSV</span>
          </button>

          <button
            onClick={onLoadSample}
            title="Reload default retail sample dataset"
            className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden md:inline">Load Sample</span>
          </button>

          <button
            onClick={onPrintReport}
            title="Generate and print comprehensive report"
            className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-all"
          >
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden xl:inline">Print Report</span>
          </button>

          <button
            onClick={onReset}
            title="Clear current data and reset analysis"
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
