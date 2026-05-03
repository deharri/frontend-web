import { Download } from 'lucide-react';
import { downloadCsv, type CsvColumn } from '@/lib/csv';
import { Button } from './Button';

export function CsvExportButton<T>({
  filename, columns, rows, label = 'Export CSV',
}: {
  filename: string;
  columns: CsvColumn<T>[];
  rows: T[];
  label?: string;
}) {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => downloadCsv(filename, columns, rows)}
      disabled={rows.length === 0}
    >
      <Download size={14} />
      {label}
    </Button>
  );
}
