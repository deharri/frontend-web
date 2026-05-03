import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Briefcase, Search, Truck } from 'lucide-react';
import { agenciesApi } from '@/api/agencies';
import { analyticsApi } from '@/api/analytics';
import { jobsApi } from '@/api/jobs';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { JobDetailDrawer } from '@/components/JobDetailDrawer';
import { BulkDispatchModal } from '@/components/BulkDispatchModal';
import { FunnelChartCard } from '@/components/FunnelChartCard';
import { CsvExportButton } from '@/components/CsvExportButton';
import { SaveFilterMenu } from '@/components/SaveFilterMenu';
import { useSavedFilters } from '@/lib/useSavedFilters';
import type { JobListingSummaryResponse, JobStatus } from '@/types';

type JobsFilters = { status: JobStatus | 'ALL'; search: string };

const STATUS_TONE: Record<JobStatus, 'amber' | 'blue' | 'green' | 'red' | 'slate'> = {
  DRAFT: 'slate',
  OPEN: 'amber',
  ASSIGNED: 'blue',
  IN_PROGRESS: 'amber',
  COMPLETED: 'green',
  CANCELLED: 'red',
  EXPIRED: 'slate',
};

const STATUS_FILTERS: Array<JobStatus | 'ALL'> = [
  'ALL', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED',
];

export function JobsPage() {
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [drawerJobId, setDrawerJobId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const filtersHook = useSavedFilters<JobsFilters>('jobs');

  const { data: agency } = useQuery({
    queryKey: ['agency', 'me'],
    queryFn: () => agenciesApi.getMyAgency(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['agency', agency?.agencyId, 'jobs'],
    queryFn: () => jobsApi.getAgencyJobs(agency!.agencyId, 0, 200),
    enabled: !!agency?.agencyId,
  });

  const { data: funnel } = useQuery({
    queryKey: ['agency', agency?.agencyId, 'analytics', 'funnel'],
    queryFn: () => analyticsApi.jobsFunnel(agency!.agencyId),
    enabled: !!agency?.agencyId,
  });

  const jobs = data?.listings ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      if (statusFilter !== 'ALL' && j.status !== statusFilter) return false;
      if (q && !`${j.title} ${j.workerTypeDisplayName} ${j.cityDisplayName}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [jobs, statusFilter, search]);

  const dispatchCandidates = jobs.filter((j) => j.status === 'ASSIGNED');

  return (
    <div className="space-y-5 max-w-7xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Jobs</h1>
          <p className="text-sm text-mutedForeground mt-1">
            All jobs assigned to your agency. Filter by status, search by title, or open a job for full detail.
          </p>
        </div>
        <Button
          onClick={() => setBulkOpen(true)}
          disabled={dispatchCandidates.length === 0}
        >
          <Truck size={14} />
          Bulk dispatch
          {dispatchCandidates.length > 0 && (
            <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-white text-primary text-[11px] font-semibold">
              {dispatchCandidates.length}
            </span>
          )}
        </Button>
      </header>

      {funnel && (
        <FunnelChartCard
          title="Pipeline funnel"
          description="Bids placed → accepted → dispatched → in progress → completed"
          stages={[
            { label: 'Bids placed',  value: funnel.bidsPlaced },
            { label: 'Bids accepted', value: funnel.bidsAccepted },
            { label: 'Dispatched',    value: funnel.dispatched },
            { label: 'In progress',   value: funnel.inProgress },
            { label: 'Completed',     value: funnel.completed },
          ]}
        />
      )}

      <Card>
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedForeground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, type, or city…"
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
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <SaveFilterMenu<JobsFilters>
            presets={filtersHook.presets}
            current={{ status: statusFilter, search }}
            onSave={(name, f) => filtersHook.save(name, f)}
            onRemove={(name) => filtersHook.remove(name)}
            onLoad={(f) => { setStatusFilter(f.status); setSearch(f.search); }}
          />
          <CsvExportButton
            filename={`jobs-${new Date().toISOString().slice(0, 10)}.csv`}
            columns={[
              { header: 'Title',     value: (j: JobListingSummaryResponse) => j.title },
              { header: 'Type',      value: (j: JobListingSummaryResponse) => j.workerTypeDisplayName },
              { header: 'City',      value: (j: JobListingSummaryResponse) => j.cityDisplayName },
              { header: 'Status',    value: (j: JobListingSummaryResponse) => j.status },
              { header: 'Budget min', value: (j: JobListingSummaryResponse) => j.budgetMin },
              { header: 'Budget max', value: (j: JobListingSummaryResponse) => j.budgetMax },
              { header: 'Bids',      value: (j: JobListingSummaryResponse) => j.bidCount },
              { header: 'Created',   value: (j: JobListingSummaryResponse) => j.createdAt },
            ]}
            rows={filtered}
          />
        </div>

        {isLoading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={search || statusFilter !== 'ALL' ? 'No matching jobs' : 'No jobs assigned yet'}
            description={
              search || statusFilter !== 'ALL'
                ? 'Try clearing the filter or search.'
                : 'Place a bid on an open consumer job, and once accepted it appears here.'
            }
          />
        ) : (
          <JobsTable rows={filtered} onRowClick={(jobId) => setDrawerJobId(jobId)} />
        )}
      </Card>

      <JobDetailDrawer
        jobId={drawerJobId}
        open={!!drawerJobId}
        onClose={() => setDrawerJobId(null)}
      />

      {agency && (
        <BulkDispatchModal
          agencyId={agency.agencyId}
          candidates={dispatchCandidates}
          open={bulkOpen}
          onClose={() => setBulkOpen(false)}
        />
      )}
    </div>
  );
}

function JobsTable({
  rows,
  onRowClick,
}: {
  rows: JobListingSummaryResponse[];
  onRowClick: (jobId: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="text-left text-xs font-semibold text-mutedForeground uppercase tracking-wider bg-muted">
          <tr>
            <th className="px-4 py-2.5">Title</th>
            <th className="px-4 py-2.5">Type</th>
            <th className="px-4 py-2.5">City</th>
            <th className="px-4 py-2.5">Budget</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Bids</th>
            <th className="px-4 py-2.5">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((j) => (
            <tr
              key={j.jobId}
              onClick={() => onRowClick(j.jobId)}
              className="cursor-pointer hover:bg-muted transition-colors"
            >
              <td className="px-4 py-2.5">
                <div className="font-medium text-foreground line-clamp-1">{j.title}</div>
                <div className="text-xs text-mutedForeground">@{j.consumerUsername}</div>
              </td>
              <td className="px-4 py-2.5">{j.workerTypeDisplayName}</td>
              <td className="px-4 py-2.5">{j.cityDisplayName}</td>
              <td className="px-4 py-2.5 text-mutedForeground">
                Rs. {j.budgetMin.toLocaleString()}–{j.budgetMax.toLocaleString()}
              </td>
              <td className="px-4 py-2.5">
                <Badge tone={STATUS_TONE[j.status]}>{j.status.replace('_', ' ')}</Badge>
              </td>
              <td className="px-4 py-2.5">{j.bidCount}</td>
              <td className="px-4 py-2.5 text-mutedForeground">{format(new Date(j.createdAt), 'PP')}</td>
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
