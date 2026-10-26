export interface RawSalesRecord {
  date: string;
  discount_pct: number;
  units_sold: number;
}

export interface CleanSalesRecord extends RawSalesRecord {
  id: string;
  predicted_units?: number;
  residual?: number;
}

export interface ValidationIssue {
  row: number;
  field: 'date' | 'discount_pct' | 'units_sold' | 'general';
  message: string;
  rawData?: Record<string, string>;
}

export interface CleaningSummary {
  totalImportedRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  duplicateRowsCount: number;
  issues: ValidationIssue[];
}

export interface DatasetState {
  name: string;
  isSample: boolean;
  rawData: RawSalesRecord[];
  cleanedData: CleanSalesRecord[];
  summary: CleaningSummary;
  excludedRowIndices: Set<number>;
  lastUpdated: string;
}
