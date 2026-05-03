import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Hand, Search } from 'lucide-react';
import { agenciesApi } from '@/api/agencies';
import { analyticsApi } from '@/api/analytics';
import { jobsApi } from '@/api/jobs';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { JobDetailDrawer } from '@/components/JobDetailDrawer';
import { DonutChartCard } from '@/components/DonutChartCard';
import { CsvExportButton } from '@/components/CsvExportButton';
import { DateRangeToggle } from '@/components/DateRangeToggle';
import { SaveFilterMenu } from '@/components/SaveFilterMenu';
import { useDateRange } from '@/lib/useDateRange';
import { useSavedFilters } from '@/lib/useSavedFilters';
import type { BidResponse, BidStatus } from '@/types';

type BidsFilters = { status: BidStatus | 'ALL'; search: string };

const STATUS_TONE: Record<BidStatus, 'amber' | 'green' | 'red' | 'slate'> = {
  PENDING: 'amber',
  ACCEPTED: 'green',
  REJECTED: 'red',
  WITHDRAWN: 'slate',
};

const STATUS_FILTERS: Array<BidStatus | 'ALL'> = [
  'ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN',
];

export function BidsPage() {
  const [statusFilter, setStatusFilter] = useState<BidStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [drawerJobId, setDrawerJobId] = useState<string | null>(null);
  const filtersHook = useSavedFilters<BidsFilters>('bids');

  const { range, preset, setPreset } = useDateRange('30D');

  const { data: agency } = useQuery({
    queryKey: ['agency', 'me'],
    queryFn: () => agenciesApi.getMyAgency(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['agency', agency?.agencyId, 'bids'],
    queryFn: () => jobsApi.getMyAgencyBids(agency!.agencyId, 0, 200),
    enabled: !!agency?.agencyId,
  });

  const { data: winRate } = useQuery({
    queryKey: ['agency', agency?.agencyId, 'analytics', 'win-rate', range.preset],
    queryFn: () => analyticsApi.bidWinRate(agency!.agencyId, range.from, range.to),
    enabled: !!agency?.agencyId,
  });

  const bids = data?.bids ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bids.filter((b) => {
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
      if (q && !`${b.coverMessage}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [bids, statusFilter, search]);

  const stats = useMemo(() => {
    const total = bids.length || 1;
    return {
      pending: bids.filter((b) => b.status === 'PENDING').length,
      accepted: bids.filter((b) => b.status === 'ACCEPTED').length,
      rejected: bids.filter((b) => b.status === 'REJECTED').length,
      withdrawn: bids.filter((b) => b.status === 'WITHDRAWN').length,
      total: bids.length,
      winRatePct: Math.round((bids.filter((b) => b.status === 'ACCEPTED').length / total) * 100),
    };
  }, [bids]);

  return (
    <div className="space-y-5 max-w-7xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Bids</h1>
          <p className="text-sm text-mutedForeground mt-1">
            Bids your agency has placed on consumer jobs. Click a bid to see the underlying job.
          </p>
        </div>
        <DateRangeToggle value={preset} onChange={setPreset} />
      </header>

      {bids.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatTile label="Total bids" value={stats.total} />
            <StatTile label="Pending" value={stats.pending} tone="amber" />
            <StatTile label="Accepted" value={stats.accepted} tone="green" />
            <StatTile label="Rejected" value={stats.rejected} tone="red" />
            <StatTile label="Win rate" value={`${stats.winRatePct}%`} tone="blue" />
          </div>
          {winRate && winRate.total > 0 && (
            <DonutChartCard
              title="Win-rate breakdown"
              description={range.label}
              data={[
                { label: 'Won',       value: winRate.won },
                { label: 'Pending',   value: winRate.pending },
                { label: 'Rejected',  value: winRate.rejected },
                { label: 'Withdrawn', value: winRate.withdrawn },
              ]}
              colors={['#16a34a', '#f59e0b', '#dc2626', '#94a3b8']}
            />
          )}
        </div>
      )}

      <Card>
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedForeground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by cover message…"
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
          <SaveFilterMenu<BidsFilters>
            presets={filtersHook.presets}
            current={{ status: statusFilter, search }}
            onSave={(name, f) => filtersHook.save(name, f)}
            onRemove={(name) => filtersHook.remove(name)}
            onLoad={(f) => { setStatusFilter(f.status); setSearch(f.search); }}
          />
          <CsvExportButton
            filename={`bids-${new Date().toISOString().slice(0, 10)}.csv`}
            columns={[
              { header: 'Bid ID',        value: (b: BidResponse) => b.bidId },
              { header: 'Job ID',        value: (b: BidResponse) => b.jobId },
              { header: 'Cover message', value: (b: BidResponse) => b.coverMessage },
              { header: 'Amount',        value: (b: BidResponse) => b.proposedAmount },
              { header: 'Rate type',     value: (b: BidResponse) => b.proposedRateType },
              { header: 'Days',          value: (b: BidResponse) => b.estimatedDays },
              { header: 'Status',        value: (b: BidResponse) => b.status },
              { header: 'Created',       value: (b: BidResponse) => b.createdAt },
            ]}
            rows={filtered}
          />
        </div>

        {isLoading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Hand}
            title={search || statusFilter !== 'ALL' ? 'No matching bids' : 'No bids placed yet'}
            description={
              search || statusFilter !== 'ALL'
                ? 'Try clearing the filter or search.'
                : 'Switch to agency mode in the mobile app and bid on an open job to see it here.'
            }
          />
        ) : (
          <BidsTable rows={filtered} onRowClick={(jobId) => setDrawerJobId(jobId)} />
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
  value: string | number;
  tone?: 'slate' | 'amber' | 'green' | 'red' | 'blue';
}) {
  const TONE_CLASS: Record<string, string> = {
    slate: 'text-foreground',
    amber: 'text-amber-500',
    green: 'text-green-600',
    red: 'text-red-700',
    blue: 'text-primary',
  };
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="text-xs font-medium text-mutedForeground uppercase tracking-wider">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${TONE_CLASS[tone]}`}>{value}</div>
    </div>
  );
}

function BidsTable({
  rows,
  onRowClick,
}: {
  rows: BidResponse[];
  onRowClick: (jobId: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="text-left text-xs font-semibold text-mutedForeground uppercase tracking-wider bg-muted">
          <tr>
            <th className="px-4 py-2.5">Bid</th>
            <th className="px-4 py-2.5">Amount</th>
            <th className="px-4 py-2.5">Days</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Placed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((b) => (
            <tr
              key={b.bidId}
              onClick={() => onRowClick(b.jobId)}
              className="cursor-pointer hover:bg-muted transition-colors"
            >
              <td className="px-4 py-2.5">
                <div className="text-sm text-foreground line-clamp-1">{b.coverMessage}</div>
                <div className="text-xs text-mutedForeground font-mono">job {b.jobId.slice(0, 8)}…</div>
              </td>
              <td className="px-4 py-2.5">
                Rs. {b.proposedAmount.toLocaleString()}{' '}
                <span className="text-xs text-mutedForeground">({b.proposedRateType})</span>
              </td>
              <td className="px-4 py-2.5">{b.estimatedDays}</td>
              <td className="px-4 py-2.5">
                <Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge>
              </td>
              <td className="px-4 py-2.5 text-mutedForeground">{format(new Date(b.createdAt), 'PP')}</td>
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
