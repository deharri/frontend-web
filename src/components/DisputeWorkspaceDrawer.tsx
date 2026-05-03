import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { disputesApi } from '@/api/disputes';
import { Badge } from './Badge';
import { Button } from './Button';
import type { Dispute, DisputeStatus } from '@/types';

const STATUS_TONE: Record<DisputeStatus, 'amber' | 'blue' | 'green' | 'slate'> = {
  OPEN: 'amber',
  UNDER_REVIEW: 'blue',
  RESOLVED: 'green',
  CLOSED: 'slate',
};

const STATUS_FORWARD: DisputeStatus[] = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'];

export function DisputeWorkspaceDrawer({
  agencyId,
  dispute,
  open,
  onClose,
}: {
  agencyId: string;
  dispute: Dispute | null;
  open: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [note, setNote] = useState('');

  useEffect(() => {
    setNote(dispute?.adminNote ?? '');
  }, [dispute?.disputeId, dispute?.adminNote]);

  const statusMutation = useMutation({
    mutationFn: (status: DisputeStatus) => disputesApi.updateStatus(dispute!.disputeId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agency', agencyId, 'disputes'] });
    },
  });

  const noteMutation = useMutation({
    mutationFn: () => disputesApi.updateNote(dispute!.disputeId, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agency', agencyId, 'disputes'] });
    },
  });

  if (!dispute) return null;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 z-40" />
        <Dialog.Content
          className="fixed top-0 right-0 bottom-0 w-full md:w-[480px] bg-card shadow-xl z-50 overflow-y-auto p-6 border-l border-border"
          aria-describedby="dispute-description"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-foreground">
                {dispute.subject}
              </Dialog.Title>
              <Dialog.Description id="dispute-description" className="text-xs text-mutedForeground mt-1">
                Raised {format(new Date(dispute.createdAt), 'PPp')}
                {' · '}
                <span className="font-mono">job {dispute.jobId.slice(0, 8)}…</span>
              </Dialog.Description>
            </div>
            <Dialog.Close className="p-1 hover:bg-muted rounded" aria-label="Close">
              <X size={16} />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-1">
              <Badge tone={STATUS_TONE[dispute.status]}>{dispute.status.replace('_', ' ')}</Badge>
              <Badge tone="slate">{dispute.category}</Badge>
              <Badge tone="slate">by {dispute.raisedByRole}</Badge>
            </div>

            <section>
              <div className="text-xs text-mutedForeground uppercase tracking-wider mb-1">Description</div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{dispute.description}</p>
            </section>

            <section>
              <div className="text-xs text-mutedForeground uppercase tracking-wider mb-1">Internal note</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full rounded border border-border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Add a note for your agency only — what's been investigated, who has been contacted, next steps."
              />
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => noteMutation.mutate()}
                  disabled={noteMutation.isPending || note === (dispute.adminNote ?? '')}
                >
                  Save note
                </Button>
              </div>
            </section>

            <section>
              <div className="text-xs text-mutedForeground uppercase tracking-wider mb-1">Move to</div>
              <div className="flex flex-wrap gap-2">
                {STATUS_FORWARD.filter((s) => s !== dispute.status).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={s === 'CLOSED' ? 'destructive' : 'secondary'}
                    onClick={() => statusMutation.mutate(s)}
                    disabled={statusMutation.isPending}
                  >
                    {s.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
