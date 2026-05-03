import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, UserPlus, Send } from 'lucide-react';
import { agenciesApi } from '@/api/agencies';
import { workersApi } from '@/api/workers';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import type { AgencySentInvitation, InvitationStatus, WorkerListItem } from '@/types';

export function InvitationsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: agency } = useQuery({
    queryKey: ['agency', 'me'],
    queryFn: () => agenciesApi.getMyAgency(),
  });

  const { data: allWorkers = [], isLoading: loadingWorkers } = useQuery({
    queryKey: ['workers', 'all'],
    queryFn: () => workersApi.getAllWorkers(),
  });

  const { data: invitations = [], isLoading: loadingInvitations } = useQuery({
    queryKey: ['agency', agency?.agencyId, 'invitations', 'sent'],
    queryFn: () => agenciesApi.getMyAgencyInvitations(),
    enabled: !!agency?.agencyId,
  });

  const inviteMutation = useMutation({
    mutationFn: (workerId: string) => agenciesApi.inviteWorker(workerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agency', agency?.agencyId, 'invitations'] });
    },
  });

  // Build a map of workerId → latest invitation status so we can disable already-pending rows.
  const inviteStatusByWorker = useMemo(() => {
    const m = new Map<string, InvitationStatus>();
    invitations.forEach((inv) => {
      if (!m.has(inv.workerId)) m.set(inv.workerId, inv.status);
    });
    return m;
  }, [invitations]);

  const filteredWorkers = useMemo(() => {
    const q = search.trim().toLowerCase();
    let pool = allWorkers;
    pool = pool.filter((w) => !w.agencyName);
    if (!q) return pool.slice(0, 25);
    return pool.filter((w) =>
      [w.firstName, w.lastName, w.username, w.workerType, w.workerTypeDisplayName, w.city]
        .join(' ')
        .toLowerCase()
        .includes(q),
    ).slice(0, 50);
  }, [allWorkers, search]);

  const inviteDisabled = !agency?.subscriptionActive || inviteMutation.isPending;
  const subInactiveHint = !agency?.subscriptionActive
    ? 'Activate your subscription to send invitations.'
    : null;

  return (
    <div className="space-y-5 max-w-6xl">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Members & Invitations</h1>
        <p className="text-sm text-mutedForeground mt-1">
          Invite workers to your agency. They appear under <span className="font-semibold text-foreground">Workers</span> once they accept.
        </p>
      </header>

      <Card title="Find workers" description="Search the marketplace and invite the ones you want.">
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedForeground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, username, skill, or city…"
            className="w-full rounded-lg border border-border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {subInactiveHint && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-600/20 px-3 py-2 text-sm text-red-700">
            {subInactiveHint}
          </div>
        )}

        {loadingWorkers ? (
          <Loading />
        ) : filteredWorkers.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No matching workers"
            description="Try a different search, or check that the workers you want aren't already in another agency."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="text-left text-xs font-semibold text-mutedForeground uppercase tracking-wider bg-muted">
                <tr>
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">City</th>
                  <th className="px-4 py-2.5">Rating</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredWorkers.map((w) => {
                  const inviteStatus = inviteStatusByWorker.get(w.workerId);
                  return (
                    <tr key={w.workerId}>
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-foreground">{w.firstName} {w.lastName}</div>
                        <div className="text-xs text-mutedForeground">@{w.username}</div>
                      </td>
                      <td className="px-4 py-2.5">{w.workerTypeDisplayName}</td>
                      <td className="px-4 py-2.5">{w.cityDisplayName ?? w.city}</td>
                      <td className="px-4 py-2.5">
                        {w.averageRating > 0 ? `★ ${w.averageRating.toFixed(1)}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {inviteStatus === 'PENDING' ? (
                          <Badge tone="amber">Invited</Badge>
                        ) : inviteStatus === 'ACCEPTED' ? (
                          <Badge tone="green">Joined</Badge>
                        ) : inviteStatus === 'REJECTED' ? (
                          <InviteButton w={w} disabled={inviteDisabled} onClick={() => inviteMutation.mutate(w.workerId)} pending={inviteMutation.isPending} label="Re-invite" />
                        ) : (
                          <InviteButton w={w} disabled={inviteDisabled} onClick={() => inviteMutation.mutate(w.workerId)} pending={inviteMutation.isPending} label="Invite" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Sent invitations" description="Invitations your agency has sent — pending, accepted, and rejected.">
        {loadingInvitations ? (
          <Loading />
        ) : invitations.length === 0 ? (
          <EmptyState icon={Send} title="No invitations sent yet" description="Invitations you send will appear here." />
        ) : (
          <SentInvitationsTable rows={invitations} />
        )}
      </Card>
    </div>
  );
}

function InviteButton({
  w, onClick, disabled, pending, label,
}: {
  w: WorkerListItem;
  onClick: () => void;
  disabled: boolean;
  pending: boolean;
  label: string;
}) {
  return (
    <Button size="sm" onClick={onClick} disabled={disabled || pending}>
      <UserPlus size={14} />
      {pending ? 'Inviting…' : label}
      <span className="sr-only"> {w.firstName}</span>
    </Button>
  );
}

function SentInvitationsTable({ rows }: { rows: AgencySentInvitation[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="text-left text-xs font-semibold text-mutedForeground uppercase tracking-wider bg-muted">
          <tr>
            <th className="px-4 py-2.5">Worker</th>
            <th className="px-4 py-2.5">Type</th>
            <th className="px-4 py-2.5">Sent</th>
            <th className="px-4 py-2.5">Responded</th>
            <th className="px-4 py-2.5">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((inv) => (
            <tr key={inv.invitationId}>
              <td className="px-4 py-2.5">
                <div className="font-medium text-foreground">{inv.workerFirstName} {inv.workerLastName}</div>
                <div className="text-xs text-mutedForeground">@{inv.workerUsername}</div>
              </td>
              <td className="px-4 py-2.5">{inv.workerType ?? '—'}</td>
              <td className="px-4 py-2.5 text-mutedForeground">{format(new Date(inv.createdAt), 'PP')}</td>
              <td className="px-4 py-2.5 text-mutedForeground">
                {inv.respondedAt ? format(new Date(inv.respondedAt), 'PP') : '—'}
              </td>
              <td className="px-4 py-2.5">
                <Badge tone={inviteStatusTone(inv.status)}>{inv.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function inviteStatusTone(s: InvitationStatus): 'green' | 'amber' | 'red' {
  if (s === 'ACCEPTED') return 'green';
  if (s === 'REJECTED') return 'red';
  return 'amber';
}

function Loading() {
  return <div className="text-sm text-mutedForeground py-8 text-center">Loading…</div>;
}
