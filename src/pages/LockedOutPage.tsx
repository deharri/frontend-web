import { Lock } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';

export function LockedOutPage() {
  const { logout } = useAuth();
  return (
    <div className="min-h-full flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card rounded-xl border border-border p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <Lock className="text-mutedForeground" size={22} />
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Dashboard not available</h1>
        <p className="text-sm text-mutedForeground mb-6">
          This dashboard is for agency owners. Open the Deharri mobile app and tap{' '}
          <span className="font-semibold text-foreground">Become an Agency</span> to set one up.
        </p>
        <button
          onClick={logout}
          className="text-sm font-medium text-primary hover:underline"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
