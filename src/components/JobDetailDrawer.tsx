import * as Dialog from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { X, MapPin, Calendar, DollarSign, User, Building2, type LucideIcon } from 'lucide-react';
import { jobsApi } from '@/api/jobs';
import { Badge } from './Badge';
import type { JobStatus } from '@/types';

interface Props {
  jobId: string | null;
  open: boolean;
  onClose: () => void;
}

const STATUS_TONE: Record<JobStatus, 'amber' | 'blue' | 'green' | 'red' | 'slate'> = {
  DRAFT: 'slate',
  OPEN: 'amber',
  ASSIGNED: 'blue',
  IN_PROGRESS: 'amber',
  COMPLETED: 'green',
  CANCELLED: 'red',
  EXPIRED: 'slate',
};

export function JobDetailDrawer({ jobId, open, onClose }: Props) {
  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsApi.getJobById(jobId!),
    enabled: open && !!jobId,
  });

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 z-40" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-xl bg-card border-l border-border shadow-2xl z-50 overflow-y-auto">
          <header className="sticky top-0 bg-card border-b border-border p-5 flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-lg font-semibold text-foreground truncate">
                {job?.title ?? 'Loading…'}
              </Dialog.Title>
              {job && (
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone={STATUS_TONE[job.status]}>{job.status.replace('_', ' ')}</Badge>
                  <span className="text-xs text-mutedForeground">{job.workerTypeDisplayName}</span>
                </div>
              )}
            </div>
            <Dialog.Close className="ml-3 p-1 rounded-md hover:bg-muted">
              <X size={18} className="text-mutedForeground" />
            </Dialog.Close>
          </header>

          {isLoading || !job ? (
            <div className="p-8 text-center text-sm text-mutedForeground">Loading…</div>
          ) : (
            <div className="p-5 space-y-5">
              <Section title="Description">
                <p className="text-sm text-foreground whitespace-pre-wrap">{job.description}</p>
              </Section>

              <Section title="Posted by">
                <Row icon={User}>
                  {job.consumerFirstName} {job.consumerLastName}
                  <span className="text-mutedForeground"> @{job.consumerUsername}</span>
                </Row>
                <Row icon={MapPin}>
                  {job.cityDisplayName}{job.area ? ` · ${job.area}` : ''}
                </Row>
                <Row icon={Calendar}>
                  Created {format(new Date(job.createdAt), 'PPpp')}
                </Row>
              </Section>

              <Section title="Budget">
                <Row icon={DollarSign}>
                  Rs. {job.budgetMin.toLocaleString()} – Rs. {job.budgetMax.toLocaleString()} ({job.budgetType})
                </Row>
              </Section>

              {job.assignedAgencyId && (
                <Section title="Assignment">
                  <Row icon={Building2}>
                    Agency: {job.assignedAgencyName ?? '—'}
                  </Row>
                  <Row icon={User}>
                    Dispatched: {job.dispatchedWorkerUsername ?? <span className="text-mutedForeground">not yet</span>}
                  </Row>
                  {job.assignedAt && (
                    <Row icon={Calendar}>
                      Assigned {format(new Date(job.assignedAt), 'PPpp')}
                    </Row>
                  )}
                </Section>
              )}

              {(job.startedAt || job.completedAt || job.consumerConfirmedAt) && (
                <Section title="Timeline">
                  {job.startedAt && (
                    <Row icon={Calendar}>Started {format(new Date(job.startedAt), 'PPpp')}</Row>
                  )}
                  {job.completedAt && (
                    <Row icon={Calendar}>Completed by worker {format(new Date(job.completedAt), 'PPpp')}</Row>
                  )}
                  {job.consumerConfirmedAt && (
                    <Row icon={Calendar}>Confirmed by consumer {format(new Date(job.consumerConfirmedAt), 'PPpp')}</Row>
                  )}
                </Section>
              )}

              {job.cancelledAt && (
                <Section title="Cancellation">
                  <Row icon={Calendar}>Cancelled {format(new Date(job.cancelledAt), 'PPpp')}</Row>
                  {job.cancellationReason && (
                    <p className="text-sm text-mutedForeground mt-2">{job.cancellationReason}</p>
                  )}
                </Section>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-mutedForeground mb-2">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm text-foreground">
      <Icon size={14} className="text-mutedForeground mt-0.5 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
