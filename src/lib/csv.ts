import Papa from 'papaparse';

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

export function downloadCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]): void {
  const data = rows.map((row) => {
    const obj: Record<string, string | number | null | undefined> = {};
    columns.forEach((c) => { obj[c.header] = c.value(row); });
    return obj;
  });
  const csv = Papa.unparse(data, { header: true });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
