import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Bell, Hand, AlertTriangle, Truck, CheckCircle2, XCircle, CreditCard, Undo2,
} from 'lucide-react';
import { agenciesApi } from '@/api/agencies';
import { notificationsApi } from '@/api/notifications';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { useAgencyEvents } from '@/lib/useAgencyEvents';
import type { AgencyNotification, NotificationKind } from '@/types';

const KIND_ICON: Record<NotificationKind, typeof Bell> = {
  BID_PLACED: Hand,
  DISPUTE_OPENED: AlertTriangle,
  JOB_DISPATCHED: Truck,
  JOB_CONFIRMED: CheckCircle2,
  JOB_CANCELLED: XCircle,
  PAYMENT_RELEASED: CreditCard,
  PAYMENT_REFUNDED: Undo2,
};

const KIND_TONE: Record<NotificationKind, string> = {
  BID_PLACED: 'text-amber-500',
  DISPUTE_OPENED: 'text-red-700',
  JOB_DISPATCHED: 'text-primary',
  JOB_CONFIRMED: 'text-green-600',
  JOB_CANCELLED: 'text-red-700',
  PAYMENT_RELEASED: 'text-green-600',
  PAYMENT_REFUNDED: 'text-amber-500',
};

export function NotificationsPage() {
  const qc = useQueryClient();
  const { data: agency } = useQuery({
    queryKey: ['agency', 'me'],
    queryFn: () => agenciesApi.getMyAgency(),
  });

  useAgencyEvents(agency?.agencyId);

  const { data, isLoading } = useQuery({
    queryKey: ['agency', agency?.agencyId, 'notifications', 'list'],
    queryFn: () => notificationsApi.list(agency!.agencyId, 0, 50),
    enabled: !!agency?.agencyId,
  });
  const items: AgencyNotification[] = data?.content ?? [];

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(agency!.agencyId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agency', agency?.agencyId, 'notifications'] });
    },
  });

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(agency!.agencyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agency', agency?.agencyId, 'notifications'] });
    },
  });

  const unreadCount = items.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-5 max-w-4xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
          <p className="text-sm text-mutedForeground mt-1">
            Real-time activity feed for your agency. {unreadCount > 0 && (
              <span className="text-primary font-medium">{unreadCount} unread.</span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
            Mark all read
          </Button>
        )}
      </header>

      <Card>
        {isLoading ? (
          <div className="text-sm text-mutedForeground py-8 text-center">Loading…</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="When workers, consumers, or the payment system act on your jobs, you'll see updates here."
          />
        ) : (
          <ul className="divide-y divide-border -my-2">
            {items.map((n) => {
              const Icon = KIND_ICON[n.kind];
              return (
                <li key={n.notificationId} className={`py-3 flex items-start gap-3 ${!n.readAt ? 'bg-blue-50/40 -mx-4 px-4' : ''}`}>
                  <div className={`mt-0.5 ${KIND_TONE[n.kind]}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">{n.title}</div>
                    {n.body && <div className="text-sm text-mutedForeground">{n.body}</div>}
                    <div className="text-xs text-mutedForeground mt-1">
                      {format(new Date(n.createdAt), 'PPp')}
                    </div>
                  </div>
                  {!n.readAt && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markRead.mutate(n.notificationId)}
                      disabled={markRead.isPending}
                    >
                      Mark read
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
