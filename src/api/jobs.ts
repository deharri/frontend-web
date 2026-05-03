import { apiClient } from './client';
import type {
  BidListResponse,
  JobListingListResponse,
  JobListingResponse,
  ResponseMessage,
} from '@/types';

export const jobsApi = {
  /** Paginated jobs assigned to an agency. */
  getAgencyJobs: (agencyId: string, page = 0, size = 100) =>
    apiClient
      .get<JobListingListResponse>(`/jobs/api/v1/listings/agency/${agencyId}`, {
        params: { page, size },
      })
      .then((r) => r.data),

  /** Full detail for a single job. Used by the row-click drawer. */
  getJobById: (jobId: string) =>
    apiClient
      .get<JobListingResponse>(`/jobs/api/v1/listings/${jobId}`)
      .then((r) => r.data),

  /** All bids on a single job (consumer-only by design — agency owner is the job's assigned party). */
  getJobBids: (jobId: string, page = 0, size = 50) =>
    apiClient
      .get<BidListResponse>(`/jobs/api/v1/listings/${jobId}/bids`, {
        params: { page, size },
      })
      .then((r) => r.data),

  /** Agency owner dispatches a specific worker to an assigned job. */
  dispatchJob: (jobId: string, workerUserId: string) =>
    apiClient
      .put<JobListingResponse>(`/jobs/api/v1/listings/${jobId}/dispatch`, {
        workerId: workerUserId,
      })
      .then((r) => r.data),

  /** Bids placed on behalf of the caller's agency. */
  getMyAgencyBids: (agencyId: string, page = 0, size = 100) =>
    apiClient
      .get<BidListResponse>('/jobs/api/v1/bids/my-agency-bids', {
        params: { agencyId, page, size },
      })
      .then((r) => r.data),

  cancelJob: (jobId: string, reason: string) =>
    apiClient
      .put<ResponseMessage>(`/jobs/api/v1/listings/${jobId}/cancel`, { reason })
      .then((r) => r.data),
};
