import type { Granularity } from '@/types';

export function GranularityToggle({
  value, onChange,
}: {
  value: Granularity;
  onChange: (g: Granularity) => void;
}) {
  const opts: Granularity[] = ['day', 'week', 'month'];
  return (
    <div className="inline-flex rounded-md border border-border bg-card p-0.5">
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-3 py-1 text-xs font-medium rounded ${
            value === o ? 'bg-primary text-white' : 'text-mutedForeground hover:bg-muted'
          }`}
        >
          {o[0].toUpperCase() + o.slice(1)}
        </button>
      ))}
    </div>
  );
}
