import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { differenceInCalendarDays } from 'date-fns';
import { agenciesApi } from '@/api/agencies';

export function SubscriptionBanner() {
  const qc = useQueryClient();
  const { data: agency } = useQuery({
    queryKey: ['agency', 'me'],
    queryFn: () => agenciesApi.getMyAgency(),
  });

  const renew = useMutation({
    mutationFn: () =>
      agenciesApi.payAgencySubscription({
        agencyId: agency!.agencyId,
        paymentMethod: 'MOCK_CARD',
        maskedDetails: '**** **** **** 4242',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agency', 'me'] }),
  });

  if (!agency) return null;

  if (!agency.subscriptionActive) {
    return (
      <div className="bg-red-50 dark:bg-red-600/15 border-b border-red-600/20 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
          <AlertCircle size={16} />
          <span>Subscription expired. Renew to invite workers and place bids.</span>
        </div>
        <button
          onClick={() => renew.mutate()}
          disabled={renew.isPending}
          className="text-sm font-semibold rounded-md bg-red-600 text-white px-3 py-1.5 hover:bg-red-700 disabled:opacity-60"
        >
          {renew.isPending ? 'Processing…' : 'Renew now'}
        </button>
      </div>
    );
  }

  if (agency.subscriptionExpiresAt) {
    const days = differenceInCalendarDays(new Date(agency.subscriptionExpiresAt), new Date());
    if (days <= 7 && days >= 0) {
      return (
        <div className="bg-amber-100 dark:bg-amber-500/15 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-500 dark:text-amber-400">
            <AlertTriangle size={16} />
            <span>
              Subscription expires in {days} day{days === 1 ? '' : 's'} — renew now to avoid disruption.
            </span>
          </div>
          <button
            onClick={() => renew.mutate()}
            disabled={renew.isPending}
            className="text-sm font-semibold rounded-md bg-amber-500 text-white px-3 py-1.5 hover:bg-amber-500/90 disabled:opacity-60"
          >
            {renew.isPending ? 'Processing…' : 'Renew'}
          </button>
        </div>
      );
    }
  }

  return null;
}
