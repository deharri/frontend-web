import { apiClient } from './client';
import type { WorkerListItem } from '@/types';

export const workersApi = {
  /** Returns all subscription-active workers in the marketplace. */
  getAllWorkers: () =>
    apiClient.get<WorkerListItem[]>('/ums/api/v1/workers').then((r) => r.data),

  /** Look up a specific worker by user-id (returns minimal profile). */
  getWorkerByUserId: (userId: string) =>
    apiClient
      .get<WorkerListItem>(`/ums/api/v1/workers/by-user/${userId}`)
      .then((r) => r.data),
};
