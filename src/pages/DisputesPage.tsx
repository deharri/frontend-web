import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { agenciesApi } from '@/api/agencies';
import { disputesApi } from '@/api/disputes';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { DisputeWorkspaceDrawer } from '@/components/DisputeWorkspaceDrawer';
import type { Dispute, DisputeCategory, DisputeStatus } from '@/types';

const CATEGORY_LABEL: Record<DisputeCategory, string> = {
  PAYMENT: 'Payment',
  NO_SHOW: 'No-show',
  QUALITY: 'Quality',
  BEHAVIOR: 'Behavior',
  OTHER: 'Other',
};

export function DisputesPage() {
  const [openDispute, setOpenDispute] = useState<Dispute | null>(null);

  const { data: agency } = useQuery({
    queryKey: ['agency', 'me'],
    queryFn: () => agenciesApi.getMyAgency(),
  });

  const { data: disputes = [], isLoading } = useQuery({
    queryKey: ['agency', agency?.agencyId, 'disputes'],
    queryFn: () => disputesApi.getAgencyDisputes(agency!.agencyId),
    enabled: !!agency?.agencyId,
  });

  // Keep the drawer's view of the dispute fresh after mutations refetch.
  const currentOpen = openDispute
    ? disputes.find((d) => d.disputeId === openDispute.disputeId) ?? openDispute
    : null;

  return (
    <div className="space-y-5 max-w-6xl">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Disputes</h1>
        <p className="text-sm text-mutedForeground mt-1">
          Issues raised on jobs assigned to your agency, by either the consumer or one of your dispatched workers.
          Click a row to open the resolution workspace.
        </p>
      </header>

      <Card>
        {isLoading ? (
          <Loading />
        ) : disputes.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No disputes"
            description="When a consumer or worker reports an issue on one of your jobs, it'll appear here."
          />
        ) : (
          <DisputesTable rows={disputes} onRowClick={(d) => setOpenDispute(d)} />
        )}
      </Card>

      {agency && (
        <DisputeWorkspaceDrawer
          agencyId={agency.agencyId}
          dispute={currentOpen}
          open={!!currentOpen}
          onClose={() => setOpenDispute(null)}
        />
      )}
    </div>
  );
}

function DisputesTable({ rows, onRowClick }: { rows: Dispute[]; onRowClick: (d: Dispute) => void }) {
  return (
    <div className="overflow-hidden">
      <table className="w-full text-sm">
        <thead className="text-left text-xs font-semibold text-mutedForeground uppercase tracking-wider bg-muted">
          <tr>
            <th className="px-4 py-2.5">Subject</th>
            <th className="px-4 py-2.5">Category</th>
            <th className="px-4 py-2.5">Raised by</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Job</th>
            <th className="px-4 py-2.5">Created</th>
            <th className="px-4 py-2.5">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((d) => (
            <tr
              key={d.disputeId}
              onClick={() => onRowClick(d)}
              className="cursor-pointer hover:bg-muted transition-colors"
            >
              <td className="px-4 py-2.5">
                <div className="font-medium text-foreground line-clamp-1">{d.subject}</div>
                <div className="text-xs text-mutedForeground line-clamp-1">{d.description}</div>
              </td>
              <td className="px-4 py-2.5">{CATEGORY_LABEL[d.category]}</td>
              <td className="px-4 py-2.5">
                <Badge tone={d.raisedByRole === 'CONSUMER' ? 'blue' : 'slate'}>
                  {d.raisedByRole}
                </Badge>
              </td>
              <td className="px-4 py-2.5">
                <Badge tone={statusTone(d.status)}>{d.status.replace('_', ' ')}</Badge>
              </td>
              <td className="px-4 py-2.5 text-xs text-mutedForeground font-mono">{d.jobId.slice(0, 8)}…</td>
              <td className="px-4 py-2.5 text-mutedForeground">{format(new Date(d.createdAt), 'PP')}</td>
              <td className="px-4 py-2.5 text-mutedForeground">{format(new Date(d.updatedAt), 'PP')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function statusTone(s: DisputeStatus): 'amber' | 'blue' | 'green' | 'slate' {
  if (s === 'OPEN') return 'amber';
  if (s === 'UNDER_REVIEW') return 'blue';
  if (s === 'RESOLVED') return 'green';
  return 'slate';
}

function Loading() {
  return <div className="text-sm text-mutedForeground py-8 text-center">Loading…</div>;
}
