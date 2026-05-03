import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Users } from 'lucide-react';
import { agenciesApi } from '@/api/agencies';
import { analyticsApi } from '@/api/analytics';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { BarChartCard } from '@/components/BarChartCard';
import { CsvExportButton } from '@/components/CsvExportButton';
import { useDateRange } from '@/lib/useDateRange';
import type { AgencyMembershipHistoryItem, WorkerListItem } from '@/types';

type Tab = 'current' | 'past' | 'all';

export function WorkersPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('current');

  const { data: agency } = useQuery({
    queryKey: ['agency', 'me'],
    queryFn: () => agenciesApi.getMyAgency(),
  });

  const { data: current = [], isLoading: loadingCurrent } = useQuery({
    queryKey: ['agency', agency?.agencyId, 'workers', 'current'],
    queryFn: () => agenciesApi.listAgencyWorkers(agency!.agencyId),
    enabled: !!agency?.agencyId,
  });

  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['agency', agency?.agencyId, 'members', 'history'],
    queryFn: () => agenciesApi.getMyMembersHistory(),
    enabled: !!agency?.agencyId,
  });

  const { range } = useDateRange('30D');

  const { data: jobsPerWorker = [] } = useQuery({
    queryKey: ['agency', agency?.agencyId, 'analytics', 'jobs-per-worker', range.preset],
    queryFn: () => analyticsApi.jobsPerWorker(agency!.agencyId, range.from, range.to),
    enabled: !!agency?.agencyId,
  });

  const removeMutation = useMutation({
    mutationFn: (workerId: string) => agenciesApi.removeWorker(workerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agency', agency?.agencyId, 'workers'] });
      qc.invalidateQueries({ queryKey: ['agency', agency?.agencyId, 'members'] });
      qc.invalidateQueries({ queryKey: ['agency', 'me'] });
    },
  });

  const onRemove = (workerId: string, name: string) => {
    if (!confirm(`Remove ${name} from your agency? Their job history stays intact.`)) return;
    removeMutation.mutate(workerId);
  };

  return (
    <div className="space-y-5 max-w-6xl">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Workers</h1>
        <p className="text-sm text-mutedForeground mt-1">
          Current members of your agency, plus past workers and full history.
        </p>
      </header>

      {jobsPerWorker.length > 0 && (
        <BarChartCard
          title="Top workers (last 30 days)"
          description="Jobs dispatched to each worker in the period."
          data={jobsPerWorker.slice(0, 10).map((w) => ({
            label: w.workerUsername,
            value: w.count,
          }))}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex border-b border-border">
          <TabButton label={`Current (${current.length})`} active={tab === 'current'} onClick={() => setTab('current')} />
          <TabButton label={`Past (${pastCount(history)})`} active={tab === 'past'} onClick={() => setTab('past')} />
          <TabButton label={`All history (${history.length})`} active={tab === 'all'} onClick={() => setTab('all')} />
        </div>
        <CsvExportButton
          filename={`workers-${new Date().toISOString().slice(0, 10)}.csv`}
          columns={[
            { header: 'First name',  value: (w: WorkerListItem) => w.firstName },
            { header: 'Last name',   value: (w: WorkerListItem) => w.lastName },
            { header: 'Username',    value: (w: WorkerListItem) => w.username },
            { header: 'Type',        value: (w: WorkerListItem) => w.workerTypeDisplayName },
            { header: 'City',        value: (w: WorkerListItem) => w.cityDisplayName ?? w.city },
            { header: 'Experience',  value: (w: WorkerListItem) => w.experienceYears },
            { header: 'Jobs done',   value: (w: WorkerListItem) => w.totalJobsCompleted },
          ]}
          rows={current}
        />
      </div>

      {tab === 'current' ? (
        loadingCurrent ? <Loading /> :
        current.length === 0 ? (
          <EmptyState icon={Users} title="No current members" description="Send invitations to add workers to your agency." />
        ) : (
          <CurrentTable workers={current} onRemove={onRemove} disabled={removeMutation.isPending} />
        )
      ) : (
        loadingHistory ? <Loading /> :
        history.length === 0 ? (
          <EmptyState icon={Users} title="No history yet" description="Once workers join or leave your agency, they'll appear here." />
        ) : (
          <HistoryTable
            rows={tab === 'past'
              ? history.filter((m) => m.membershipStatus !== 'ACTIVE')
              : history}
          />
        )
      )}
    </div>
  );
}

function pastCount(history: AgencyMembershipHistoryItem[]): number {
  return history.filter((m) => m.membershipStatus !== 'ACTIVE').length;
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active
          ? 'text-primary border-primary'
          : 'text-mutedForeground border-transparent hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

function Loading() {
  return <div className="text-sm text-mutedForeground py-8 text-center">Loading…</div>;
}

function CurrentTable({
  workers,
  onRemove,
  disabled,
}: {
  workers: WorkerListItem[];
  onRemove: (workerId: string, name: string) => void;
  disabled: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div className="overflow-hidden bg-card rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="text-left text-xs font-semibold text-mutedForeground uppercase tracking-wider bg-muted">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Worker type</th>
            <th className="px-4 py-3">City</th>
            <th className="px-4 py-3">Experience</th>
            <th className="px-4 py-3">Jobs done</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {workers.map((w) => (
            <tr
              key={w.userId}
              className="cursor-pointer hover:bg-muted transition-colors"
              onClick={() => navigate(`/workers/${w.userId}`)}
            >
              <td className="px-4 py-3">
                <div className="font-medium text-foreground">{w.firstName} {w.lastName}</div>
                <div className="text-xs text-mutedForeground">@{w.username}</div>
              </td>
              <td className="px-4 py-3">{w.workerTypeDisplayName}</td>
              <td className="px-4 py-3">{w.cityDisplayName ?? w.city}</td>
              <td className="px-4 py-3">{w.experienceYears}y</td>
              <td className="px-4 py-3">{w.totalJobsCompleted}</td>
              <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemove(w.workerId, `${w.firstName} ${w.lastName}`)}
                  disabled={disabled}
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HistoryTable({ rows }: { rows: AgencyMembershipHistoryItem[] }) {
  return (
    <div className="overflow-hidden bg-card rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="text-left text-xs font-semibold text-mutedForeground uppercase tracking-wider bg-muted">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Worker type</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3">Left</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((m) => (
            <tr key={m.memberId}>
              <td className="px-4 py-3">
                <div className="font-medium text-foreground">{m.firstName} {m.lastName}</div>
                <div className="text-xs text-mutedForeground">@{m.username}</div>
              </td>
              <td className="px-4 py-3">{m.workerType ?? '—'}</td>
              <td className="px-4 py-3 text-mutedForeground">{format(new Date(m.joinedAt), 'PP')}</td>
              <td className="px-4 py-3 text-mutedForeground">
                {m.leftAt ? format(new Date(m.leftAt), 'PP') : '—'}
              </td>
              <td className="px-4 py-3">
                <Badge tone={statusTone(m.membershipStatus)}>{m.membershipStatus}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function statusTone(status: 'ACTIVE' | 'LEFT' | 'REMOVED'): 'green' | 'amber' | 'red' {
  if (status === 'ACTIVE') return 'green';
  if (status === 'REMOVED') return 'red';
  return 'amber';
}
