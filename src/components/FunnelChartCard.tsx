import { Card } from './Card';

interface Stage { label: string; value: number }

export function FunnelChartCard({
  title, description, stages,
}: {
  title: string;
  description?: string;
  stages: Stage[];
}) {
  const max = Math.max(...stages.map((s) => s.value), 1);
  return (
    <Card title={title} description={description}>
      <div className="space-y-2">
        {stages.map((s, i) => {
          const pct = (s.value / max) * 100;
          const dropoff = i > 0 && stages[i - 1].value > 0
            ? Math.round((1 - s.value / stages[i - 1].value) * 100)
            : 0;
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between text-xs text-mutedForeground mb-1">
                <span>{s.label}</span>
                <span>
                  <span className="font-semibold text-foreground">{s.value.toLocaleString()}</span>
                  {i > 0 && dropoff > 0 && (
                    <span className="ml-2 text-red-700">−{dropoff}%</span>
                  )}
                </span>
              </div>
              <div className="h-6 bg-muted rounded">
                <div
                  className="h-6 rounded bg-primary"
                  style={{ width: `${pct}%`, transition: 'width 200ms' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
