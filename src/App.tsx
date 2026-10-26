import React, { useState } from 'react';
import { useSalesData } from './hooks/useSalesData';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { CsvUploaderModal } from './components/upload/CsvUploaderModal';
import { PrintableReport } from './components/report/PrintableReport';
import { Overview } from './pages/Overview';
import { SalesData } from './pages/SalesData';
import { TrendAnalysis } from './pages/TrendAnalysis';
import { RegressionAnalysis } from './pages/RegressionAnalysis';
import { EigenAnalysis } from './pages/EigenAnalysis';
import { Predictions } from './pages/Predictions';
import { About } from './pages/About';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [printReportOpen, setPrintReportOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    dataset,
    activeRecords,
    analysis,
    loadSampleDataset,
    loadUploadedCSV,
    resetDataset,
    toggleExcludeRow,
    removeRowPermanently,
  } = useSalesData();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation Bar */}
      <Navbar
        dataset={dataset}
        activeCount={activeRecords.length}
        onOpenUpload={() => setUploadModalOpen(true)}
        onLoadSample={loadSampleDataset}
        onReset={resetDataset}
        onPrintReport={() => setPrintReportOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(p => !p)}
      />

      {/* Main Body with Persistent Sidebar and Content Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
          recordCount={activeRecords.length}
        />

        {/* Dynamic Main Page Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'overview' && (
            <Overview
              dataset={dataset}
              records={activeRecords}
              analysis={analysis}
              onOpenUpload={() => setUploadModalOpen(true)}
              onLoadSample={loadSampleDataset}
              onNavigateToTab={setCurrentTab}
            />
          )}

          {currentTab === 'sales-data' && (
            <SalesData
              dataset={dataset}
              records={activeRecords}
              analysis={analysis}
              onToggleExclude={toggleExcludeRow}
              onRemovePermanently={removeRowPermanently}
            />
          )}

          {currentTab === 'trend-analysis' && (
            <TrendAnalysis
              records={activeRecords}
              analysis={analysis}
            />
          )}

          {currentTab === 'regression' && (
            <RegressionAnalysis
              records={activeRecords}
              analysis={analysis}
            />
          )}

          {currentTab === 'eigen-analysis' && (
            <EigenAnalysis
              records={activeRecords}
              analysis={analysis}
            />
          )}

          {currentTab === 'predictions' && (
            <Predictions
              records={activeRecords}
              analysis={analysis}
            />
          )}

          {currentTab === 'about' && (
            <About />
          )}
        </main>
      </div>

      {/* CSV Uploader Modal */}
      <CsvUploaderModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onApplyData={(content, filename) => loadUploadedCSV(content, filename)}
      />

      {/* Printable Report Modal */}
      {printReportOpen && (
        <PrintableReport
          dataset={dataset}
          records={activeRecords}
          analysis={analysis}
          onClose={() => setPrintReportOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
