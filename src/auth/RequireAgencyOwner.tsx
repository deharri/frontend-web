import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { agenciesApi } from '@/api/agencies';
import { useAuth } from './useAuth';
import { LockedOutPage } from '@/pages/LockedOutPage';

export function RequireAgencyOwner({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['agency', 'me'],
    queryFn: () => agenciesApi.getMyAgency(),
    enabled: isAuthenticated,
    retry: false,
  });

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-sm text-mutedForeground">Loading…</div>
      </div>
    );
  }

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 401) return <Navigate to="/login" replace />;
    return <LockedOutPage />;
  }

  if (!data) return <LockedOutPage />;

  return <>{children}</>;
}
