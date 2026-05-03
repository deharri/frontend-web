import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function KpiCard({
  label,
  value,
  growthPct,
  icon,
  tone = 'slate',
}: {
  label: string;
  value: string | number;
  growthPct?: number;
  icon?: ReactNode;
  tone?: 'slate' | 'amber' | 'green' | 'red' | 'blue';
}) {
  const TONE: Record<string, string> = {
    slate: 'text-foreground',
    amber: 'text-amber-500',
    green: 'text-green-600',
    red:   'text-red-700',
    blue:  'text-primary',
  };
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-mutedForeground uppercase tracking-wider">{label}</div>
        {icon && <div className="text-mutedForeground">{icon}</div>}
      </div>
      <div className={`mt-2 text-2xl font-bold ${TONE[tone]}`}>{value}</div>
      {typeof growthPct === 'number' && (
        <div className="mt-1 flex items-center gap-1 text-xs">
          {growthPct >= 0
            ? <TrendingUp size={12} className="text-green-600" />
            : <TrendingDown size={12} className="text-red-700" />}
          <span className={growthPct >= 0 ? 'text-green-600' : 'text-red-700'}>
            {growthPct >= 0 ? '+' : ''}{growthPct.toFixed(1)}% vs prev
          </span>
        </div>
      )}
    </div>
  );
}
