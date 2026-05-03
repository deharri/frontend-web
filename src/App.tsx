import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import { RequireAgencyOwner } from '@/auth/RequireAgencyOwner';
import { AppShell } from '@/layout/AppShell';
import { LoginPage } from '@/pages/LoginPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { WorkersPage } from '@/pages/WorkersPage';
import { WorkerDrillDownPage } from '@/pages/WorkerDrillDownPage';
import { JobsPage } from '@/pages/JobsPage';
import { BidsPage } from '@/pages/BidsPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { DisputesPage } from '@/pages/DisputesPage';
import { InvitationsPage } from '@/pages/InvitationsPage';
import { AgencyProfilePage } from '@/pages/AgencyProfilePage';
import { ReportsPage } from '@/pages/ReportsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAgencyOwner>
              <AppShell />
            </RequireAgencyOwner>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="/workers" element={<WorkersPage />} />
          <Route path="/workers/:userId" element={<WorkerDrillDownPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/bids" element={<BidsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/disputes" element={<DisputesPage />} />
          <Route path="/invitations" element={<InvitationsPage />} />
          <Route path="/profile" element={<AgencyProfilePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
