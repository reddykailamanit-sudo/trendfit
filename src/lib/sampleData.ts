import { CleanSalesRecord } from '../types/sales';

export const SAMPLE_CSV_TEXT = `date,discount_pct,units_sold
2026-10-01,5,20
2026-10-02,10,27
2026-10-03,15,32
2026-10-04,20,41
2026-10-05,25,46
2026-10-06,10,29
2026-10-07,30,53
2026-10-08,15,35
2026-10-09,5,22
2026-10-10,20,39
2026-10-11,35,62
2026-10-12,25,48
2026-10-13,10,31
2026-10-14,30,56`;

export const CSV_TEMPLATE_TEXT = `date,discount_pct,units_sold
2026-10-01,5,20
2026-10-02,10,25
2026-10-03,15,30`;

export function getInitialSampleRecords(): CleanSalesRecord[] {
  return [
    { id: 'sample-1', date: '2026-10-01', discount_pct: 5, units_sold: 20 },
    { id: 'sample-2', date: '2026-10-02', discount_pct: 10, units_sold: 27 },
    { id: 'sample-3', date: '2026-10-03', discount_pct: 15, units_sold: 32 },
    { id: 'sample-4', date: '2026-10-04', discount_pct: 20, units_sold: 41 },
    { id: 'sample-5', date: '2026-10-05', discount_pct: 25, units_sold: 46 },
    { id: 'sample-6', date: '2026-10-06', discount_pct: 10, units_sold: 29 },
    { id: 'sample-7', date: '2026-10-07', discount_pct: 30, units_sold: 53 },
    { id: 'sample-8', date: '2026-10-08', discount_pct: 15, units_sold: 35 },
    { id: 'sample-9', date: '2026-10-09', discount_pct: 5, units_sold: 22 },
    { id: 'sample-10', date: '2026-10-10', discount_pct: 20, units_sold: 39 },
    { id: 'sample-11', date: '2026-10-11', discount_pct: 35, units_sold: 62 },
    { id: 'sample-12', date: '2026-10-12', discount_pct: 25, units_sold: 48 },
    { id: 'sample-13', date: '2026-10-13', discount_pct: 10, units_sold: 31 },
    { id: 'sample-14', date: '2026-10-14', discount_pct: 30, units_sold: 56 },
  ];
}
