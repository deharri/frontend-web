import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FileText, Printer } from 'lucide-react';
import { agenciesApi } from '@/api/agencies';
import { analyticsApi } from '@/api/analytics';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { CsvExportButton } from '@/components/CsvExportButton';
import { KpiCard } from '@/components/KpiCard';
import { useDateRange } from '@/lib/useDateRange';
import { DateRangeToggle } from '@/components/DateRangeToggle';
import type {
  JobStatusCount, JobsByCityRow, JobsByWorkerTypeRow, JobsPerWorkerRow,
} from '@/types';

export function ReportsPage() {
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
  const { data: byCity = [] } = useQuery({
    queryKey: ['agency', aid, 'analytics', 'by-city'],
    queryFn: () => analyticsApi.jobsByCity(aid!),
    enabled: !!aid,
  });
  const { data: byType = [] } = useQuery({
    queryKey: ['agency', aid, 'analytics', 'by-worker-type'],
    queryFn: () => analyticsApi.jobsByWorkerType(aid!),
    enabled: !!aid,
  });
  const { data: perWorker = [] } = useQuery({
    queryKey: ['agency', aid, 'analytics', 'jobs-per-worker', range.preset],
    queryFn: () => analyticsApi.jobsPerWorker(aid!, range.from, range.to),
    enabled: !!aid,
  });
  const { data: revenueTotals } = useQuery({
    queryKey: ['agency', aid, 'analytics', 'revenue-totals', range.preset],
    queryFn: () => analyticsApi.revenueTotals(aid!, range.from, range.to, range.prevFrom, range.prevTo),
    enabled: !!aid,
  });
  const { data: funnel } = useQuery({
    queryKey: ['agency', aid, 'analytics', 'funnel'],
    queryFn: () => analyticsApi.jobsFunnel(aid!),
    enabled: !!aid,
  });

  const totalJobs = statusCounts.reduce((s, c) => s + c.count, 0);
  const completed = statusCounts.find((c) => c.status === 'COMPLETED')?.count ?? 0;
  const completionRate = totalJobs > 0 ? Math.round((completed / totalJobs) * 1000) / 10 : 0;

  if (!agency) {
    return <div className="text-sm text-mutedForeground">Loading…</div>;
  }

  return (
    <div className="space-y-5 max-w-6xl print:max-w-none">
      <header className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
          <p className="text-sm text-mutedForeground mt-1">
            One-page snapshot of your agency's performance, ready to share or print.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeToggle value={preset} onChange={setPreset} />
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer size={14} />
            Print / Save PDF
          </Button>
        </div>
      </header>

      <div className="hidden print:block mb-4">
        <h1 className="text-xl font-bold">{agency.agencyName} — Performance Report</h1>
        <p className="text-sm text-mutedForeground">
          {range.label} · Generated {format(new Date(), 'PP')}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total jobs (all-time)" value={totalJobs} />
        <KpiCard label="Completed jobs" value={completed} tone="green" />
        <KpiCard label="Completion rate" value={`${completionRate}%`} tone="blue" />
        <KpiCard
          label="Revenue (range)"
          value={`Rs. ${(revenueTotals?.thisRange ?? 0).toLocaleString()}`}
          growthPct={revenueTotals?.growthPct}
          tone="green"
        />
      </div>

      <Card title="Pipeline funnel" description="Bids → accepted → dispatched → in progress → completed">
        {funnel ? (
          <ul className="text-sm space-y-1">
            <FunnelLine label="Bids placed" value={funnel.bidsPlaced} />
            <FunnelLine label="Bids accepted" value={funnel.bidsAccepted} />
            <FunnelLine label="Dispatched" value={funnel.dispatched} />
            <FunnelLine label="In progress" value={funnel.inProgress} />
            <FunnelLine label="Completed" value={funnel.completed} />
          </ul>
        ) : (
          <p className="text-sm text-mutedForeground">No funnel data.</p>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title="Jobs by status">
          <DataList rows={statusCounts.map((s) => ({ label: s.status.replace('_', ' '), value: s.count }))} />
        </Card>
        <Card title="Jobs by city">
          <DataList rows={byCity.map((c) => ({ label: c.city, value: c.count }))} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title="Jobs by worker type">
          <DataList rows={byType.map((c) => ({ label: c.workerType, value: c.count }))} />
        </Card>
        <Card title={`Top workers (${range.label})`}>
          <DataList rows={perWorker.slice(0, 10).map((w) => ({
            label: '@' + w.workerUsername,
            value: w.count,
          }))} />
        </Card>
      </div>

      <Card title="Export bundle" description="Download the data behind every section.">
        <div className="flex flex-wrap gap-2">
          <CsvExportButton<JobStatusCount>
            filename={`status-${new Date().toISOString().slice(0,10)}.csv`}
            columns={[
              { header: 'Status', value: (r) => r.status },
              { header: 'Count',  value: (r) => r.count },
            ]}
            rows={statusCounts}
            label="Status CSV"
          />
          <CsvExportButton<JobsByCityRow>
            filename={`by-city-${new Date().toISOString().slice(0,10)}.csv`}
            columns={[
              { header: 'City',  value: (r) => r.city },
              { header: 'Count', value: (r) => r.count },
            ]}
            rows={byCity}
            label="By city CSV"
          />
          <CsvExportButton<JobsByWorkerTypeRow>
            filename={`by-worker-type-${new Date().toISOString().slice(0,10)}.csv`}
            columns={[
              { header: 'Worker type', value: (r) => r.workerType },
              { header: 'Count',       value: (r) => r.count },
            ]}
            rows={byType}
            label="By worker-type CSV"
          />
          <CsvExportButton<JobsPerWorkerRow>
            filename={`top-workers-${new Date().toISOString().slice(0,10)}.csv`}
            columns={[
              { header: 'Worker user-id', value: (r) => r.workerUserId },
              { header: 'Username',       value: (r) => r.workerUsername },
              { header: 'Jobs',           value: (r) => r.count },
            ]}
            rows={perWorker}
            label="Top workers CSV"
          />
        </div>
      </Card>

      <p className="text-xs text-mutedForeground print:hidden flex items-center gap-1">
        <FileText size={12} /> Tip: use your browser's "Save as PDF" option from the print dialog.
      </p>
    </div>
  );
}

function DataList({ rows }: { rows: { label: string; value: number }[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-mutedForeground">No data.</p>;
  }
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center gap-3 text-sm">
          <span className="w-32 truncate text-mutedForeground">{r.label}</span>
          <span className="flex-1 h-2 bg-muted rounded">
            <span
              className="block h-2 rounded bg-primary"
              style={{ width: `${(r.value / max) * 100}%` }}
            />
          </span>
          <span className="w-10 text-right font-medium tabular-nums">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}

function FunnelLine({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex justify-between">
      <span className="text-mutedForeground">{label}</span>
      <span className="font-semibold tabular-nums">{value.toLocaleString()}</span>
    </li>
  );
}
