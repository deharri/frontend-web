import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Briefcase, Hand, Users, AlertTriangle, CreditCard, Building2 } from 'lucide-react';
import { agenciesApi } from '@/api/agencies';
import { analyticsApi } from '@/api/analytics';
import { jobsApi } from '@/api/jobs';
import { paymentsApi } from '@/api/payments';
import { disputesApi } from '@/api/disputes';
import { Card } from '@/components/Card';
import { KpiCard } from '@/components/KpiCard';
import { LineChartCard } from '@/components/LineChartCard';
import { DonutChartCard } from '@/components/DonutChartCard';
import { DateRangeToggle } from '@/components/DateRangeToggle';
import { useDateRange } from '@/lib/useDateRange';

export function OverviewPage() {
  const { range, preset, setPreset } = useDateRange('30D');

  const { data: agency } = useQuery({
    queryKey: ['agency', 'me'],
    queryFn: () => agenciesApi.getMyAgency(),
  });

  const aid = agency?.agencyId;

  const { data: statusCounts = [] } = useQuery({
    queryKey: ['agency', aid, 'analytics', 'status-counts'],
    queryFn: () => analyticsApi.jobStatusCounts(aid!),
    enabled: !!aid,
  });

  const { data: revenueTotals } = useQuery({
    queryKey: ['agency', aid, 'analytics', 'revenue-totals', range.preset],
    queryFn: () => analyticsApi.revenueTotals(aid!, range.from, range.to, range.prevFrom, range.prevTo),
    enabled: !!aid,
  });

  const { data: revenueSeries = [] } = useQuery({
    queryKey: ['agency', aid, 'analytics', 'revenue', range.preset, 'current'],
    queryFn: () => analyticsApi.revenueOverTime(aid!, range.granularity, range.from, range.to),
    enabled: !!aid,
  });
  const { data: revenuePrevSeries = [] } = useQuery({
    queryKey: ['agency', aid, 'analytics', 'revenue', range.preset, 'prev'],
    queryFn: () => analyticsApi.revenueOverTime(aid!, range.granularity, range.prevFrom, range.prevTo),
    enabled: !!aid,
  });

  const { data: bidsData } = useQuery({
    queryKey: ['agency', aid, 'bids'],
    queryFn: () => jobsApi.getMyAgencyBids(aid!, 0, 200),
    enabled: !!aid,
  });
  const pendingBids = (bidsData?.bids ?? []).filter((b) => b.status === 'PENDING').length;

  const { data: disputes = [] } = useQuery({
    queryKey: ['agency', aid, 'disputes'],
    queryFn: () => disputesApi.getAgencyDisputes(aid!),
    enabled: !!aid,
  });
  const openDisputes = disputes.filter((d) => d.status === 'OPEN').length;

  const { data: workers = [] } = useQuery({
    queryKey: ['agency', aid, 'workers', 'current'],
    queryFn: () => agenciesApi.listAgencyWorkers(aid!),
    enabled: !!aid,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['agency', aid, 'payments'],
    queryFn: () => paymentsApi.getAgencyPayments(aid!),
    enabled: !!aid,
  });

  if (!agency) {
    return <div className="text-sm text-mutedForeground">Loading…</div>;
  }

  const activeJobs = statusCounts
    .filter((c) => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS')
    .reduce((sum, c) => sum + c.count, 0);

  const fmtBucket = (s: string) =>
    range.granularity === 'month'
      ? format(new Date(s), 'MMM')
      : format(new Date(s), 'd MMM');

  const revenueLineSeries = [
    {
      name: 'Current',
      color: '#2563eb',
      data: revenueSeries.map((p) => ({ x: fmtBucket(p.bucket), y: p.total })),
    },
    {
      name: 'Previous',
      color: '#94a3b8',
      data: revenuePrevSeries.map((p) => ({ x: fmtBucket(p.bucket), y: p.total })),
    },
  ];

  const statusDonut = statusCounts.map((c) => ({
    label: c.status.replace('_', ' '),
    value: c.count,
  }));

  return (
    <div className="space-y-5 max-w-7xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
          <p className="text-sm text-mutedForeground mt-1">
            Snapshot of your agency's pipeline, revenue, and recent activity.
          </p>
        </div>
        <DateRangeToggle value={preset} onChange={setPreset} />
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Active jobs"     value={activeJobs}                                          icon={<Briefcase size={14} />} tone="blue" />
        <KpiCard label="Pending bids"    value={pendingBids}                                         icon={<Hand size={14} />}      tone="amber" />
        <KpiCard label="Active workers"  value={workers.length}                                      icon={<Users size={14} />} />
        <KpiCard label="Open disputes"   value={openDisputes}                                        icon={<AlertTriangle size={14} />} tone={openDisputes > 0 ? 'red' : 'slate'} />
        <KpiCard
          label="Revenue (range)"
          value={`Rs. ${(revenueTotals?.thisRange ?? 0).toLocaleString()}`}
          growthPct={revenueTotals?.growthPct}
          icon={<CreditCard size={14} />}
          tone="green"
        />
        <KpiCard
          label="Subscription"
          value={agency.subscriptionActive ? 'Active' : 'Inactive'}
          icon={<Building2 size={14} />}
          tone={agency.subscriptionActive ? 'green' : 'red'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <LineChartCard
            title="Revenue over time"
            description={`${range.label} vs previous`}
            series={revenueLineSeries}
            yFormatter={(v) => `Rs. ${v.toLocaleString()}`}
          />
        </div>
        <DonutChartCard
          title="Jobs by status"
          description="All-time"
          data={statusDonut}
        />
      </div>

      <Card title="Recent payments">
        {payments.length === 0 ? (
          <p className="text-sm text-mutedForeground">No payments received yet.</p>
        ) : (
          <ul className="divide-y divide-border -my-2">
            {payments.slice(0, 8).map((p) => (
              <li key={p.transactionId} className="py-2 flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <div className="font-medium text-foreground">
                    {p.currency} {p.amount.toLocaleString()}{' '}
                    <span className="ml-2 text-xs px-2 py-0.5 rounded bg-muted text-mutedForeground font-normal">{p.status}</span>
                  </div>
                  <div className="text-xs text-mutedForeground font-mono">job {p.jobId.slice(0, 8)}…</div>
                </div>
                <div className="text-xs text-mutedForeground">
                  {format(new Date(p.updatedAt), 'PP')}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
