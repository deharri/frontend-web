import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '@/api/client';
import type { NotificationKind } from '@/types';

/**
 * Subscribes to the agency event stream and invalidates relevant React-Query caches
 * so dependent screens reload without an explicit user refresh.
 */
export function useAgencyEvents(agencyId: string | undefined) {
  const qc = useQueryClient();
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!agencyId) return;
    const token = localStorage.getItem('accessToken');
    const url = `${BASE_URL.replace(/\/$/, '')}/jobs/api/v1/events/agency/${agencyId}`
              + (token ? `?token=${encodeURIComponent(token)}` : '');
    const es = new EventSource(url, { withCredentials: false });
    sourceRef.current = es;

    const handler = (kind: NotificationKind) => () => {
      qc.invalidateQueries({ queryKey: ['agency', agencyId, 'notifications'] });

      switch (kind) {
        case 'BID_PLACED':
          qc.invalidateQueries({ queryKey: ['agency', agencyId, 'bids'] });
          qc.invalidateQueries({ queryKey: ['agency', agencyId, 'analytics'] });
          break;
        case 'DISPUTE_OPENED':
          qc.invalidateQueries({ queryKey: ['agency', agencyId, 'disputes'] });
          break;
        case 'JOB_DISPATCHED':
        case 'JOB_CONFIRMED':
        case 'JOB_CANCELLED':
          qc.invalidateQueries({ queryKey: ['agency', agencyId, 'jobs'] });
          qc.invalidateQueries({ queryKey: ['agency', agencyId, 'analytics'] });
          break;
        case 'PAYMENT_RELEASED':
        case 'PAYMENT_REFUNDED':
          qc.invalidateQueries({ queryKey: ['agency', agencyId, 'payments'] });
          qc.invalidateQueries({ queryKey: ['agency', agencyId, 'analytics'] });
          break;
      }
    };

    const kinds: NotificationKind[] = [
      'BID_PLACED', 'DISPUTE_OPENED', 'JOB_DISPATCHED',
      'JOB_CONFIRMED', 'JOB_CANCELLED', 'PAYMENT_RELEASED', 'PAYMENT_REFUNDED',
    ];
    kinds.forEach((k) => es.addEventListener(k, handler(k)));

    es.onerror = () => {
      // Browser will auto-reconnect; nothing to do.
    };

    return () => {
      es.close();
      sourceRef.current = null;
    };
  }, [agencyId, qc]);
}
