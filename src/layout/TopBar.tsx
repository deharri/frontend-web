import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { LogOut, ChevronDown, Bell } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { agenciesApi } from '@/api/agencies';
import { notificationsApi } from '@/api/notifications';
import { useAuth } from '@/auth/useAuth';
import { useAgencyEvents } from '@/lib/useAgencyEvents';

export function TopBar() {
  const { user, logout } = useAuth();
  const { data: agency } = useQuery({
    queryKey: ['agency', 'me'],
    queryFn: () => agenciesApi.getMyAgency(),
  });

  useAgencyEvents(agency?.agencyId);

  const { data: unread } = useQuery({
    queryKey: ['agency', agency?.agencyId, 'notifications', 'unread'],
    queryFn: () => notificationsApi.unread(agency!.agencyId),
    enabled: !!agency?.agencyId,
    refetchInterval: 60_000,
  });
  const unreadCount = unread?.unread ?? 0;

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'AD';

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
      <div>
        <div className="text-sm font-semibold text-foreground">
          {agency?.agencyName ?? '—'}
        </div>
        <div className="text-xs text-mutedForeground">
          {agency?.subscriptionActive ? 'Subscription active' : 'Subscription inactive'}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to="/notifications"
          className="relative inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell size={18} className="text-mutedForeground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="flex items-center gap-2 hover:bg-muted px-2 py-1.5 rounded-md">
            <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
              {initials}
            </div>
            <span className="text-sm text-foreground">@{user?.username}</span>
            <ChevronDown size={14} className="text-mutedForeground" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="min-w-[160px] bg-card rounded-md border border-border shadow-md p-1"
            >
              <DropdownMenu.Item
                onSelect={logout}
                className="flex items-center gap-2 px-2 py-2 text-sm rounded-sm hover:bg-muted cursor-pointer outline-none"
              >
                <LogOut size={14} />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
