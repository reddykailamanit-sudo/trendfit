/**
 * Lightweight, robust client-side CSV parser that handles commas, quotes, and whitespace.
 */
export function parseCSVString(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = csvText
    .split(/\r\n|\n|\r/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Parse header line
  const headers = splitCSVLine(lines[0]).map(h => h.trim().toLowerCase());

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    const rowObj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = values[j] !== undefined ? values[j].trim() : '';
    }
    rows.push(rowObj);
  }

  return { headers, rows };
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
