import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SubscriptionBanner } from './SubscriptionBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function AppShell() {
  return (
    <div className="h-full flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <SubscriptionBanner />
        <main className="flex-1 overflow-auto p-6 bg-background" tabIndex={-1}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
