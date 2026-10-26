import { useState, useMemo, useCallback } from 'react';
import { CleanSalesRecord, DatasetState, RawSalesRecord } from '../types/sales';
import { OverallAnalysis } from '../types/analysis';
import { getInitialSampleRecords, SAMPLE_CSV_TEXT } from '../lib/sampleData';
import { cleanAndValidateCSV } from '../lib/dataCleaning';
import { calculateLinearRegression } from '../lib/regression';
import { calculateCorrelation } from '../lib/correlation';
import { calculateCovarianceMatrix } from '../lib/covariance';
import { calculateEigenAnalysis } from '../lib/eigenAnalysis';
import { generateInsights } from '../lib/insights';

export function useSalesData() {
  const initialData = useMemo(() => {
    const parsed = cleanAndValidateCSV(SAMPLE_CSV_TEXT);
    return {
      name: 'Sample Retail Discount Dataset',
      isSample: true,
      rawData: parsed.allRawRecords,
      cleanedData: parsed.validRecords,
      summary: parsed.summary,
      excludedRowIndices: new Set<number>(),
      lastUpdated: new Date().toLocaleTimeString()
    };
  }, []);

  const [dataset, setDataset] = useState<DatasetState>(initialData);

  // Active records after applying user exclusions
  const activeRecords = useMemo<CleanSalesRecord[]>(() => {
    return dataset.cleanedData.filter((_, idx) => !dataset.excludedRowIndices.has(idx));
  }, [dataset.cleanedData, dataset.excludedRowIndices]);

  // Overall mathematical analysis
  const analysis = useMemo<OverallAnalysis>(() => {
    const regression = calculateLinearRegression(activeRecords);
    const correlation = calculateCorrelation(activeRecords);
    const covariance = calculateCovarianceMatrix(activeRecords);
    const eigen = calculateEigenAnalysis(covariance);

    // Build partial analysis object for insight generation
    const baseAnalysis: OverallAnalysis = {
      regression,
      correlation,
      covariance,
      eigen,
      insights: []
    };

    baseAnalysis.insights = generateInsights(baseAnalysis, activeRecords);
    return baseAnalysis;
  }, [activeRecords]);

  // Enrich active records with predicted values & residuals
  const enrichedRecords = useMemo<CleanSalesRecord[]>(() => {
    if (!analysis.regression.isCalculable) {
      return activeRecords;
    }
    const { intercept, slope } = analysis.regression;
    return activeRecords.map(r => {
      const pred = intercept + slope * r.discount_pct;
      const res = r.units_sold - pred;
      return {
        ...r,
        predicted_units: pred,
        residual: res
      };
    });
  }, [activeRecords, analysis.regression]);

  const loadSampleDataset = useCallback(() => {
    const parsed = cleanAndValidateCSV(SAMPLE_CSV_TEXT);
    setDataset({
      name: 'Sample Retail Discount Dataset',
      isSample: true,
      rawData: parsed.allRawRecords,
      cleanedData: parsed.validRecords,
      summary: parsed.summary,
      excludedRowIndices: new Set<number>(),
      lastUpdated: new Date().toLocaleTimeString()
    });
  }, []);

  const loadUploadedCSV = useCallback((csvText: string, filename: string) => {
    const parsed = cleanAndValidateCSV(csvText);
    setDataset({
      name: filename,
      isSample: false,
      rawData: parsed.allRawRecords,
      cleanedData: parsed.validRecords,
      summary: parsed.summary,
      excludedRowIndices: new Set<number>(),
      lastUpdated: new Date().toLocaleTimeString()
    });
  }, []);

  const resetDataset = useCallback(() => {
    setDataset({
      name: 'Empty Dataset',
      isSample: false,
      rawData: [],
      cleanedData: [],
      summary: {
        totalImportedRows: 0,
        validRowsCount: 0,
        invalidRowsCount: 0,
        duplicateRowsCount: 0,
        issues: []
      },
      excludedRowIndices: new Set<number>(),
      lastUpdated: new Date().toLocaleTimeString()
    });
  }, []);

  const toggleExcludeRow = useCallback((index: number) => {
    setDataset(prev => {
      const nextExclusions = new Set(prev.excludedRowIndices);
      if (nextExclusions.has(index)) {
        nextExclusions.delete(index);
      } else {
        nextExclusions.add(index);
      }
      return {
        ...prev,
        excludedRowIndices: nextExclusions
      };
    });
  }, []);

  const removeRowPermanently = useCallback((index: number) => {
    setDataset(prev => {
      const nextCleaned = prev.cleanedData.filter((_, idx) => idx !== index);
      const nextRaw = prev.rawData.filter((_, idx) => idx !== index);
      return {
        ...prev,
        cleanedData: nextCleaned,
        rawData: nextRaw,
        summary: {
          ...prev.summary,
          validRowsCount: nextCleaned.length,
          totalImportedRows: Math.max(0, prev.summary.totalImportedRows - 1)
        }
      };
    });
  }, []);

  return {
    dataset,
    activeRecords: enrichedRecords,
    analysis,
    loadSampleDataset,
    loadUploadedCSV,
    resetDataset,
    toggleExcludeRow,
    removeRowPermanently
  };
}
