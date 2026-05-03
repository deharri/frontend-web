import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card } from './Card';

interface Series {
  name: string;
  color: string;
  data: { x: string; y: number }[];
}

export function LineChartCard({
  title, description, height = 280, series, yFormatter,
}: {
  title: string;
  description?: string;
  height?: number;
  series: Series[];
  yFormatter?: (v: number) => string;
}) {
  const xKeys = Array.from(new Set(series.flatMap((s) => s.data.map((d) => d.x)))).sort();
  const data = xKeys.map((x) => {
    const row: Record<string, string | number> = { x };
    series.forEach((s) => { row[s.name] = s.data.find((d) => d.x === x)?.y ?? 0; });
    return row;
  });
  return (
    <Card title={title} description={description}>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 16, bottom: 10, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="x" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} tickFormatter={yFormatter} />
            <Tooltip formatter={(v: any) => (yFormatter && typeof v === 'number') ? yFormatter(v) : v} />
            {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
            {series.map((s) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
