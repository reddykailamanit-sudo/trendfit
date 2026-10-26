import { RawSalesRecord, CleanSalesRecord, CleaningSummary, ValidationIssue } from '../types/sales';
import { parseCSVString } from './csvParser';

export function cleanAndValidateCSV(csvText: string): {
  validRecords: CleanSalesRecord[];
  allRawRecords: RawSalesRecord[];
  summary: CleaningSummary;
} {
  const { headers, rows } = parseCSVString(csvText);

  const issues: ValidationIssue[] = [];
  const validRecords: CleanSalesRecord[] = [];
  const allRawRecords: RawSalesRecord[] = [];

  // Match column names flexibly
  const dateCol = headers.find(h => ['date', 'day', 'timestamp'].includes(h));
  const discountCol = headers.find(h => [
    'discount_pct', 'discount', 'discount%', 'discount_percent', 'discountpct', 'disc'
  ].includes(h));
  const unitsCol = headers.find(h => [
    'units_sold', 'units', 'sales', 'quantity', 'unitsold', 'sold'
  ].includes(h));

  if (!dateCol || !discountCol || !unitsCol) {
    issues.push({
      row: 1,
      field: 'general',
      message: `Missing required columns. Expected: 'date', 'discount_pct', 'units_sold'. Found headers: [${headers.join(', ')}]`
    });
    return {
      validRecords: [],
      allRawRecords: [],
      summary: {
        totalImportedRows: rows.length,
        validRowsCount: 0,
        invalidRowsCount: rows.length,
        duplicateRowsCount: 0,
        issues
      }
    };
  }

  const seenKeys = new Map<string, number>();
  let duplicateCount = 0;

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // 1-indexed, skipping header row
    const rawDate = row[dateCol];
    const rawDiscount = row[discountCol];
    const rawUnits = row[unitsCol];

    let isRowValid = true;

    // Validate date
    if (!rawDate || rawDate.trim() === '') {
      issues.push({
        row: rowNum,
        field: 'date',
        message: 'Missing date value.',
        rawData: row
      });
      isRowValid = false;
    } else {
      const parsedDate = new Date(rawDate);
      if (isNaN(parsedDate.getTime())) {
        issues.push({
          row: rowNum,
          field: 'date',
          message: `Invalid date format: "${rawDate}". Expected standard format like YYYY-MM-DD.`,
          rawData: row
        });
        isRowValid = false;
      }
    }

    // Validate discount
    const discountVal = Number(rawDiscount);
    if (rawDiscount === '' || isNaN(discountVal)) {
      issues.push({
        row: rowNum,
        field: 'discount_pct',
        message: `Invalid non-numeric discount: "${rawDiscount}".`,
        rawData: row
      });
      isRowValid = false;
    } else if (discountVal < 0 || discountVal > 100) {
      issues.push({
        row: rowNum,
        field: 'discount_pct',
        message: `Discount ${discountVal}% is out of bounds (must be between 0% and 100%).`,
        rawData: row
      });
      isRowValid = false;
    }

    // Validate units sold
    const unitsVal = Number(rawUnits);
    if (rawUnits === '' || isNaN(unitsVal)) {
      issues.push({
        row: rowNum,
        field: 'units_sold',
        message: `Invalid non-numeric units sold: "${rawUnits}".`,
        rawData: row
      });
      isRowValid = false;
    } else if (unitsVal < 0) {
      issues.push({
        row: rowNum,
        field: 'units_sold',
        message: `Negative units sold (${unitsVal}) is not allowed.`,
        rawData: row
      });
      isRowValid = false;
    } else if (!Number.isInteger(unitsVal)) {
      issues.push({
        row: rowNum,
        field: 'units_sold',
        message: `Fractional units sold (${unitsVal}) is invalid; product sales must be whole integers.`,
        rawData: row
      });
      isRowValid = false;
    }

    // Check duplicates
    if (isRowValid) {
      const recordKey = `${rawDate.trim()}_${discountVal}_${unitsVal}`;
      if (seenKeys.has(recordKey)) {
        duplicateCount++;
        issues.push({
          row: rowNum,
          field: 'general',
          message: `Duplicate record detected (matches row ${seenKeys.get(recordKey)}). Kept as observation unless excluded.`,
          rawData: row
        });
      } else {
        seenKeys.set(recordKey, rowNum);
      }

      const rawRecord: RawSalesRecord = {
        date: rawDate.trim(),
        discount_pct: discountVal,
        units_sold: unitsVal
      };

      allRawRecords.push(rawRecord);

      validRecords.push({
        id: `rec-${idx}-${Date.now()}`,
        ...rawRecord
      });
    }
  });

  return {
    validRecords,
    allRawRecords,
    summary: {
      totalImportedRows: rows.length,
      validRowsCount: validRecords.length,
      invalidRowsCount: rows.length - validRecords.length,
      duplicateRowsCount: duplicateCount,
      issues
    }
  };
}
