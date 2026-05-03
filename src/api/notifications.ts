import { apiClient } from './client';
import type { AgencyNotification, PageResponse, UnreadSummary } from '@/types';

export const notificationsApi = {
  list: (agencyId: string, page = 0, size = 30) =>
    apiClient
      .get<PageResponse<AgencyNotification>>(
        `/jobs/api/v1/agencies/${agencyId}/notifications`,
        { params: { page, size } },
      )
      .then((r) => r.data),

  unread: (agencyId: string) =>
    apiClient
      .get<UnreadSummary>(`/jobs/api/v1/agencies/${agencyId}/notifications/unread`)
      .then((r) => r.data),

  markRead: (agencyId: string, notificationId: string) =>
    apiClient
      .put<void>(`/jobs/api/v1/agencies/${agencyId}/notifications/${notificationId}/read`)
      .then((r) => r.data),

  markAllRead: (agencyId: string) =>
    apiClient
      .put<void>(`/jobs/api/v1/agencies/${agencyId}/notifications/read-all`)
      .then((r) => r.data),
};
