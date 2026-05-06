import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, Hand, CreditCard,
  AlertTriangle, UserPlus, Building2, FileBarChart, Bell,
} from 'lucide-react';

const items = [
  { to: '/',              label: 'Overview',          icon: LayoutDashboard },
  { to: '/workers',       label: 'Workers',           icon: Users },
  { to: '/jobs',          label: 'Jobs',              icon: Briefcase },
  { to: '/bids',          label: 'Bids',              icon: Hand },
  { to: '/payments',      label: 'Payments',          icon: CreditCard },
  { to: '/disputes',      label: 'Disputes',          icon: AlertTriangle },
  { to: '/invitations',   label: 'Invitations',       icon: UserPlus },
  { to: '/profile',       label: 'Agency Profile',    icon: Building2 },
  { to: '/reports',       label: 'Reports',           icon: FileBarChart },
  { to: '/notifications', label: 'Notifications',     icon: Bell },
];

export function Sidebar() {
  return (
    <aside className="w-16 lg:w-60 border-r border-border bg-card flex flex-col flex-shrink-0 transition-[width]">
      <div className="p-5 border-b border-border">
        <div className="text-base font-semibold text-foreground">
          <span className="lg:hidden">D</span>
          <span className="hidden lg:inline">Deharri</span>
        </div>
        <div className="text-xs text-mutedForeground hidden lg:block">Agency Dashboard</div>
      </div>
      <nav className="flex-1 py-3" aria-label="Main">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            aria-label={label}
            title={label}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-5 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-blue-50 dark:bg-primary/15 text-primary border-r-2 border-primary font-medium'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-muted',
              ].join(' ')
            }
          >
            <Icon size={16} />
            <span className="hidden lg:inline">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
