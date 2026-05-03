import type { RangePreset } from '@/lib/useDateRange';

export function DateRangeToggle({
  value, onChange,
}: {
  value: RangePreset;
  onChange: (p: RangePreset) => void;
}) {
  const opts: { v: RangePreset; label: string }[] = [
    { v: 'MTD', label: 'Month to date' },
    { v: '7D',  label: '7 days' },
    { v: '30D', label: '30 days' },
    { v: '12M', label: '12 months' },
  ];
  return (
    <div className="inline-flex rounded-md border border-border bg-card p-0.5">
      {opts.map(({ v, label }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-3 py-1 text-xs font-medium rounded ${
            value === v ? 'bg-primary text-white' : 'text-mutedForeground hover:bg-muted'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
