import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { agenciesApi } from '@/api/agencies';
import { jobsApi } from '@/api/jobs';
import { Button } from './Button';
import type { JobListingSummaryResponse } from '@/types';

interface Props {
  agencyId: string;
  candidates: JobListingSummaryResponse[];
  open: boolean;
  onClose: () => void;
}

interface DispatchResult {
  jobId: string;
  jobTitle: string;
  ok: boolean;
  error?: string;
}

export function BulkDispatchModal({ agencyId, candidates, open, onClose }: Props) {
  const qc = useQueryClient();
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [results, setResults] = useState<DispatchResult[] | null>(null);

  const { data: workers = [] } = useQuery({
    queryKey: ['agency', agencyId, 'workers', 'current'],
    queryFn: () => agenciesApi.listAgencyWorkers(agencyId),
    enabled: open,
  });

  const dispatchMutation = useMutation({
    mutationFn: async () => {
      const out: DispatchResult[] = [];
      for (const jobId of selectedJobs) {
        const job = candidates.find((c) => c.jobId === jobId);
        try {
          await jobsApi.dispatchJob(jobId, selectedWorker);
          out.push({ jobId, jobTitle: job?.title ?? jobId, ok: true });
        } catch (err) {
          const e = err as { response?: { data?: { message?: string } } };
          out.push({
            jobId,
            jobTitle: job?.title ?? jobId,
            ok: false,
            error: e.response?.data?.message ?? 'Dispatch failed',
          });
        }
      }
      return out;
    },
    onSuccess: (out) => {
      setResults(out);
      qc.invalidateQueries({ queryKey: ['agency', agencyId, 'jobs'] });
    },
  });

  const reset = () => {
    setSelectedJobs(new Set());
    setSelectedWorker('');
    setResults(null);
  };

  const toggleJob = (jobId: string) => {
    setSelectedJobs((prev) => {
      const next = new Set(prev);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
      return next;
    });
  };

  const onCloseAndReset = () => { reset(); onClose(); };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onCloseAndReset()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card rounded-xl border border-border shadow-2xl z-50 max-h-[80vh] flex flex-col">
          <header className="border-b border-border p-5 flex items-start justify-between">
            <div>
              <Dialog.Title className="text-lg font-semibold text-foreground">Bulk dispatch</Dialog.Title>
              <p className="text-sm text-mutedForeground mt-1">
                Pick a worker and the jobs they should be dispatched to.
              </p>
            </div>
            <Dialog.Close className="p-1 rounded-md hover:bg-muted" onClick={onCloseAndReset}>
              <X size={18} className="text-mutedForeground" />
            </Dialog.Close>
          </header>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {results ? (
              <ResultsView results={results} />
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-mutedForeground mb-1">Worker</label>
                  <select
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">— Select a worker —</option>
                    {workers.map((w) => (
                      <option key={w.userId} value={w.userId}>
                        {w.firstName} {w.lastName} · {w.workerTypeDisplayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-mutedForeground mb-1">
                    Jobs to dispatch ({selectedJobs.size} selected)
                  </label>
                  {candidates.length === 0 ? (
                    <p className="text-sm text-mutedForeground">No undispatched ASSIGNED jobs right now.</p>
                  ) : (
                    <div className="space-y-1 border border-border rounded-lg p-2 max-h-72 overflow-y-auto">
                      {candidates.map((j) => (
                        <label
                          key={j.jobId}
                          className="flex items-start gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedJobs.has(j.jobId)}
                            onChange={() => toggleJob(j.jobId)}
                            className="mt-1"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{j.title}</div>
                            <div className="text-xs text-mutedForeground">
                              {j.workerTypeDisplayName} · {j.cityDisplayName} · Rs. {j.budgetMin.toLocaleString()}–{j.budgetMax.toLocaleString()}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <footer className="border-t border-border p-4 flex items-center justify-end gap-2">
            {results ? (
              <Button onClick={onCloseAndReset}>Close</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={onCloseAndReset}>Cancel</Button>
                <Button
                  onClick={() => dispatchMutation.mutate()}
                  disabled={
                    dispatchMutation.isPending ||
                    !selectedWorker ||
                    selectedJobs.size === 0
                  }
                >
                  {dispatchMutation.isPending
                    ? `Dispatching ${selectedJobs.size}…`
                    : `Dispatch ${selectedJobs.size} job${selectedJobs.size === 1 ? '' : 's'}`}
                </Button>
              </>
            )}
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ResultsView({ results }: { results: DispatchResult[] }) {
  const ok = results.filter((r) => r.ok);
  const fail = results.filter((r) => !r.ok);
  return (
    <div className="space-y-3">
      <div className="text-sm">
        <span className="font-semibold text-green-600">{ok.length} succeeded</span>
        {fail.length > 0 && (
          <span className="text-mutedForeground">, <span className="font-semibold text-red-700">{fail.length} failed</span></span>
        )}
      </div>
      <ul className="space-y-1">
        {results.map((r) => (
          <li key={r.jobId} className="flex items-start gap-2 text-sm">
            {r.ok
              ? <CheckCircle2 size={14} className="text-green-600 mt-0.5 shrink-0" />
              : <AlertCircle size={14} className="text-red-700 mt-0.5 shrink-0" />}
            <div className="min-w-0">
              <div className="text-foreground truncate">{r.jobTitle}</div>
              {!r.ok && <div className="text-xs text-red-700">{r.error}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
