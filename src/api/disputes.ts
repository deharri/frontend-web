import { apiClient } from './client';
import type { Dispute, DisputeStatus } from '@/types';

export const disputesApi = {
  /** List disputes filed on any job assigned to the given agency. Caller must own the agency. */
  getAgencyDisputes: (agencyId: string) =>
    apiClient
      .get<Dispute[]>(`/jobs/api/v1/agencies/${agencyId}/disputes`)
      .then((r) => r.data),

  updateStatus: (disputeId: string, status: DisputeStatus) =>
    apiClient
      .put<Dispute>(`/jobs/api/v1/disputes/${disputeId}/status`, { status })
      .then((r) => r.data),

  updateNote: (disputeId: string, note: string) =>
    apiClient
      .put<Dispute>(`/jobs/api/v1/disputes/${disputeId}/note`, { note })
      .then((r) => r.data),
};
