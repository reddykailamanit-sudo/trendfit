import React, { useState, useRef } from 'react';
import { Upload, X, FileText, AlertTriangle, CheckCircle, Download, FileSpreadsheet } from 'lucide-react';
import { cleanAndValidateCSV } from '../../lib/dataCleaning';
import { CSV_TEMPLATE_TEXT } from '../../lib/sampleData';

interface CsvUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (csvContent: string, filename: string) => void;
}

export const CsvUploaderModal: React.FC<CsvUploaderModalProps> = ({
  isOpen,
  onClose,
  onApplyData,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFilename, setSelectedFilename] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [analysisSummary, setAnalysisSummary] = useState<ReturnType<typeof cleanAndValidateCSV> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setSelectedFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setRawText(content);
      const validation = cleanAndValidateCSV(content);
      setAnalysisSummary(validation);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE_TEXT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'trendfit_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleApply = () => {
    if (analysisSummary && analysisSummary.validRecords.length > 0) {
      onApplyData(rawText, selectedFilename || 'uploaded_data.csv');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Import Sales CSV</h3>
              <p className="text-xs text-slate-500">
                Upload daily retail records with date, discount_pct, and units_sold
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Drag & drop upload area */}
          <div
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {selectedFilename ? selectedFilename : 'Click to select or drag and drop CSV file'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports standard CSV format with comma delimiters
            </p>
          </div>

          {/* Template download link */}
          <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-600">Need a starting structure?</span>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download CSV Template
            </button>
          </div>

          {/* Validation summary */}
          {analysisSummary && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-slate-500 font-medium">Total Rows</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">
                    {analysisSummary.summary.totalImportedRows}
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="text-emerald-700 font-medium">Valid Rows</div>
                  <div className="text-lg font-bold text-emerald-800 mt-1">
                    {analysisSummary.summary.validRowsCount}
                  </div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="text-amber-700 font-medium">Invalid Rows</div>
                  <div className="text-lg font-bold text-amber-800 mt-1">
                    {analysisSummary.summary.invalidRowsCount}
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="text-indigo-700 font-medium">Duplicates</div>
                  <div className="text-lg font-bold text-indigo-800 mt-1">
                    {analysisSummary.summary.duplicateRowsCount}
                  </div>
                </div>
              </div>

              {/* Issues listing */}
              {analysisSummary.summary.issues.length > 0 && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 max-h-40 overflow-y-auto text-xs">
                  <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Cleaning &amp; Validation Diagnostics ({analysisSummary.summary.issues.length}):</span>
                  </div>
                  <ul className="space-y-1 pl-5 list-disc text-amber-800">
                    {analysisSummary.summary.issues.slice(0, 8).map((issue, i) => (
                      <li key={i}>
                        <span className="font-semibold">Row {issue.row}:</span> {issue.message}
                      </li>
                    ))}
                    {analysisSummary.summary.issues.length > 8 && (
                      <li className="text-slate-500 italic">
                        ...and {analysisSummary.summary.issues.length - 8} more issues.
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Preview table */}
              {analysisSummary.validRecords.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2">
                    Valid Observations Preview (First {Math.min(5, analysisSummary.validRecords.length)} rows):
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-3 py-2 font-medium">Date</th>
                          <th className="px-3 py-2 font-medium">Discount (%)</th>
                          <th className="px-3 py-2 font-medium">Units Sold</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {analysisSummary.validRecords.slice(0, 5).map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2 text-slate-800">{r.date}</td>
                            <td className="px-3 py-2 text-indigo-700 font-mono font-medium">{r.discount_pct}%</td>
                            <td className="px-3 py-2 text-slate-900 font-mono font-medium">{r.units_sold}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={!analysisSummary || analysisSummary.validRecords.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl text-white transition-all ${
              !analysisSummary || analysisSummary.validRecords.length === 0
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            Apply Dataset ({analysisSummary?.validRecords.length || 0} valid rows)
          </button>
        </div>
      </div>
    </div>
  );
};
