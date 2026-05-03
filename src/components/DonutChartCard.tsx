import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from './Card';

export function DonutChartCard({
  title, description, height = 280, data, colors,
}: {
  title: string;
  description?: string;
  height?: number;
  data: { label: string; value: number }[];
  colors?: string[];
}) {
  const palette = colors ?? ['#2563eb', '#f59e0b', '#16a34a', '#dc2626', '#94a3b8', '#a855f7'];
  return (
    <Card title={title} description={description}>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
