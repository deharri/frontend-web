import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card } from './Card';

export function BarChartCard({
  title, description, height = 280, data, dataKey = 'value', labelKey = 'label', color = '#2563eb',
}: {
  title: string;
  description?: string;
  height?: number;
  data: { label: string; value: number }[];
  dataKey?: string;
  labelKey?: string;
  color?: string;
}) {
  return (
    <Card title={title} description={description}>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 16, bottom: 10, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={labelKey} stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip />
            <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
