import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, isAfter } from 'date-fns';
import { CreditCard, Search } from 'lucide-react';
import { agenciesApi } from '@/api/agencies';
import { analyticsApi } from '@/api/analytics';
import { paymentsApi } from '@/api/payments';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { JobDetailDrawer } from '@/components/JobDetailDrawer';
import { LineChartCard } from '@/components/LineChartCard';
import { CsvExportButton } from '@/components/CsvExportButton';
import { DateRangeToggle } from '@/components/DateRangeToggle';
import { SaveFilterMenu } from '@/components/SaveFilterMenu';
import { useDateRange } from '@/lib/useDateRange';
import { useSavedFilters } from '@/lib/useSavedFilters';
import type { PaymentTransaction, TransactionStatus } from '@/types';

type PaymentsFilters = { status: TransactionStatus | 'ALL'; search: string };

const STATUS_TONE: Record<TransactionStatus, 'amber' | 'green' | 'red' | 'slate'> = {
  PENDING: 'slate',
  HELD: 'amber',
  RELEASED: 'green',
  REFUNDED: 'slate',
  FAILED: 'red',
  CANCELLED: 'slate',
};

const STATUS_FILTERS: Array<TransactionStatus | 'ALL'> = [
  'ALL', 'HELD', 'RELEASED', 'REFUNDED', 'FAILED', 'CANCELLED',
];

export function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [drawerJobId, setDrawerJobId] = useState<string | null>(null);
  const filtersHook = useSavedFilters<PaymentsFilters>('payments');

  const { range, preset, setPreset } = useDateRange('30D');

  const { data: agency } = useQuery({
    queryKey: ['agency', 'me'],
    queryFn: () => agenciesApi.getMyAgency(),
  });

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['agency', agency?.agencyId, 'payments'],
    queryFn: () => paymentsApi.getAgencyPayments(agency!.agencyId),
    enabled: !!agency?.agencyId,
  });

  const { data: revenueSeries = [] } = useQuery({
    queryKey: ['agency', agency?.agencyId, 'analytics', 'revenue', range.preset, 'current'],
    queryFn: () => analyticsApi.revenueOverTime(agency!.agencyId, range.granularity, range.from, range.to),
    enabled: !!agency?.agencyId,
  });
  const { data: revenuePrev = [] } = useQuery({
    queryKey: ['agency', agency?.agencyId, 'analytics', 'revenue', range.preset, 'prev'],
    queryFn: () => analyticsApi.revenueOverTime(agency!.agencyId, range.granularity, range.prevFrom, range.prevTo),
    enabled: !!agency?.agencyId,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter((p) => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (q && !`${p.jobId} ${p.transactionId} ${p.notes ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [payments, statusFilter, search]);

  const stats = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const released = payments.filter((p) => p.status === 'RELEASED');
    const releasedThisMonth = released.filter(
      (p) => isAfter(new Date(p.updatedAt), monthStart),
    );
    const held = payments.filter((p) => p.status === 'HELD');
    const totalReceived = released.reduce((sum, p) => sum + p.amount, 0);
    const thisMonth = releasedThisMonth.reduce((sum, p) => sum + p.amount, 0);
    const heldNow = held.reduce((sum, p) => sum + p.amount, 0);
    const avgJobValue = released.length > 0
      ? Math.round(totalReceived / released.length)
      : 0;
    return { totalReceived, thisMonth, heldNow, avgJobValue };
  }, [payments]);

  return (
    <div className="space-y-5 max-w-7xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Payments</h1>
          <p className="text-sm text-mutedForeground mt-1">
            Transactions where your agency is the recipient. Held funds are released when the consumer confirms job completion.
          </p>
        </div>
        <DateRangeToggle value={preset} onChange={setPreset} />
      </header>

      {payments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile label="Received this month" value={`Rs. ${stats.thisMonth.toLocaleString()}`} />
          <StatTile label="Currently held" value={`Rs. ${stats.heldNow.toLocaleString()}`} tone="amber" />
          <StatTile label="Average job value" value={`Rs. ${stats.avgJobValue.toLocaleString()}`} />
          <StatTile label="Total received" value={`Rs. ${stats.totalReceived.toLocaleString()}`} tone="green" />
        </div>
      )}

      {revenueSeries.length + revenuePrev.length > 0 && (
        <LineChartCard
          title="Revenue over time"
          description={`${range.label} vs previous`}
          series={[
            {
              name: 'Current',
              color: '#16a34a',
              data: revenueSeries.map((p) => ({
                x: range.granularity === 'month'
                  ? format(new Date(p.bucket), 'MMM')
                  : format(new Date(p.bucket), 'd MMM'),
                y: p.total,
              })),
            },
            {
              name: 'Previous',
              color: '#94a3b8',
              data: revenuePrev.map((p) => ({
                x: range.granularity === 'month'
                  ? format(new Date(p.bucket), 'MMM')
                  : format(new Date(p.bucket), 'd MMM'),
                y: p.total,
              })),
            },
          ]}
          yFormatter={(v) => `Rs. ${v.toLocaleString()}`}
        />
      )}

      <Card>
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedForeground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job id, transaction id, notes…"
              className="w-full rounded-lg border border-border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-primary text-white'
                    : 'bg-muted text-mutedForeground hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <SaveFilterMenu<PaymentsFilters>
            presets={filtersHook.presets}
            current={{ status: statusFilter, search }}
            onSave={(name, f) => filtersHook.save(name, f)}
            onRemove={(name) => filtersHook.remove(name)}
            onLoad={(f) => { setStatusFilter(f.status); setSearch(f.search); }}
          />
          <CsvExportButton
            filename={`payments-${new Date().toISOString().slice(0, 10)}.csv`}
            columns={[
              { header: 'Transaction',  value: (p: PaymentTransaction) => p.transactionId },
              { header: 'Job ID',       value: (p: PaymentTransaction) => p.jobId },
              { header: 'Amount',       value: (p: PaymentTransaction) => p.amount },
              { header: 'Currency',     value: (p: PaymentTransaction) => p.currency },
              { header: 'Method',       value: (p: PaymentTransaction) => p.paymentMethod },
              { header: 'Status',       value: (p: PaymentTransaction) => p.status },
              { header: 'Created',      value: (p: PaymentTransaction) => p.createdAt },
              { header: 'Updated',      value: (p: PaymentTransaction) => p.updatedAt },
            ]}
            rows={filtered}
          />
        </div>

        {isLoading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title={search || statusFilter !== 'ALL' ? 'No matching transactions' : 'No payments yet'}
            description={
              search || statusFilter !== 'ALL'
                ? 'Try clearing the filter or search.'
                : 'When a consumer pays for a job your agency was assigned, the transaction appears here.'
            }
          />
        ) : (
          <PaymentsTable rows={filtered} onRowClick={(jobId) => setDrawerJobId(jobId)} />
        )}
      </Card>

      <JobDetailDrawer
        jobId={drawerJobId}
        open={!!drawerJobId}
        onClose={() => setDrawerJobId(null)}
      />
    </div>
  );
}

function StatTile({
  label, value, tone = 'slate',
}: {
  label: string;
  value: string;
  tone?: 'slate' | 'amber' | 'green';
}) {
  const TONE_CLASS: Record<string, string> = {
    slate: 'text-foreground',
    amber: 'text-amber-500',
    green: 'text-green-600',
  };
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="text-xs font-medium text-mutedForeground uppercase tracking-wider">{label}</div>
      <div className={`mt-1 text-xl font-bold ${TONE_CLASS[tone]}`}>{value}</div>
    </div>
  );
}

function PaymentsTable({
  rows,
  onRowClick,
}: {
  rows: PaymentTransaction[];
  onRowClick: (jobId: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="text-left text-xs font-semibold text-mutedForeground uppercase tracking-wider bg-muted">
          <tr>
            <th className="px-4 py-2.5">Transaction</th>
            <th className="px-4 py-2.5">Amount</th>
            <th className="px-4 py-2.5">Method</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Created</th>
            <th className="px-4 py-2.5">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((p) => (
            <tr
              key={p.transactionId}
              onClick={() => onRowClick(p.jobId)}
              className="cursor-pointer hover:bg-muted transition-colors"
            >
              <td className="px-4 py-2.5">
                <div className="font-mono text-xs text-foreground">{p.transactionId.slice(0, 8)}…</div>
                <div className="font-mono text-xs text-mutedForeground">job {p.jobId.slice(0, 8)}…</div>
              </td>
              <td className="px-4 py-2.5 font-semibold">{p.currency} {p.amount.toLocaleString()}</td>
              <td className="px-4 py-2.5">{p.paymentMethod.replace('MOCK_', '')}</td>
              <td className="px-4 py-2.5">
                <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
              </td>
              <td className="px-4 py-2.5 text-mutedForeground">{format(new Date(p.createdAt), 'PP')}</td>
              <td className="px-4 py-2.5 text-mutedForeground">{format(new Date(p.updatedAt), 'PP')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Loading() {
  return <div className="text-sm text-mutedForeground py-8 text-center">Loading…</div>;
}
