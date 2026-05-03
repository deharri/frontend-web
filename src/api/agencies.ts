import { apiClient } from './client';
import type {
  AgencyMembershipHistoryItem,
  AgencyProfile,
  AgencySentInvitation,
  PayAgencySubscriptionRequest,
  ResponseMessage,
  UpdateAgency,
  WorkerListItem,
} from '@/types';

export const agenciesApi = {
  // Phase 1
  getMyAgency: () =>
    apiClient.get<AgencyProfile>('/ums/api/v1/agencies/me').then((r) => r.data),

  payAgencySubscription: (req: PayAgencySubscriptionRequest) =>
    apiClient
      .post<ResponseMessage>('/payments/api/v1/agency-subscriptions/pay', req)
      .then((r) => r.data),

  // Phase 2 additions
  updateMyAgency: (data: UpdateAgency) =>
    apiClient.put<ResponseMessage>('/ums/api/v1/agencies/me', data).then((r) => r.data),

  /**
   * License upload uses multipart/form-data. Caller passes the File from a
   * browser <input type="file"/>; we wrap it in FormData.
   */
  uploadLicense: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient
      .post<ResponseMessage>('/ums/api/v1/agencies/license/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  listAgencyWorkers: (agencyId: string) =>
    apiClient
      .get<WorkerListItem[]>(`/ums/api/v1/agencies/${agencyId}/workers`)
      .then((r) => r.data),

  getMyMembersHistory: () =>
    apiClient
      .get<AgencyMembershipHistoryItem[]>('/ums/api/v1/agencies/me/members/history')
      .then((r) => r.data),

  getMyAgencyInvitations: () =>
    apiClient
      .get<AgencySentInvitation[]>('/ums/api/v1/agencies/me/invitations')
      .then((r) => r.data),

  inviteWorker: (workerId: string) =>
    apiClient
      .post<ResponseMessage>(`/ums/api/v1/agencies/workers/${workerId}/invite`)
      .then((r) => r.data),

  removeWorker: (workerId: string) =>
    apiClient
      .delete<ResponseMessage>(`/ums/api/v1/agencies/workers/${workerId}`)
      .then((r) => r.data),
};
