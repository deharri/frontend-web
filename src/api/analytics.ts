import { apiClient } from './client';
import type {
  BidWinRate,
  Granularity,
  JobStatusCount,
  JobsByCityRow,
  JobsByWorkerTypeRow,
  JobsFunnel,
  JobsPerWorkerRow,
  RevenueOverTimePoint,
  RevenueTotals,
  TimeSeriesBucket,
} from '@/types';

export const analyticsApi = {
  jobStatusCounts: (agencyId: string) =>
    apiClient
      .get<JobStatusCount[]>(`/jobs/api/v1/listings/agency/${agencyId}/analytics/job-status-counts`)
      .then((r) => r.data),

  jobsOverTime: (agencyId: string, granularity: Granularity, from: Date, to: Date) =>
    apiClient
      .get<TimeSeriesBucket[]>(`/jobs/api/v1/listings/agency/${agencyId}/analytics/jobs-over-time`, {
        params: { granularity, from: from.toISOString(), to: to.toISOString() },
      })
      .then((r) => r.data),

  jobsByCity: (agencyId: string) =>
    apiClient
      .get<JobsByCityRow[]>(`/jobs/api/v1/listings/agency/${agencyId}/analytics/jobs-by-city`)
      .then((r) => r.data),

  jobsByWorkerType: (agencyId: string) =>
    apiClient
      .get<JobsByWorkerTypeRow[]>(`/jobs/api/v1/listings/agency/${agencyId}/analytics/jobs-by-worker-type`)
      .then((r) => r.data),

  jobsPerWorker: (agencyId: string, from: Date, to: Date) =>
    apiClient
      .get<JobsPerWorkerRow[]>(`/jobs/api/v1/listings/agency/${agencyId}/analytics/jobs-per-worker`, {
        params: { from: from.toISOString(), to: to.toISOString() },
      })
      .then((r) => r.data),

  jobsFunnel: (agencyId: string) =>
    apiClient
      .get<JobsFunnel>(`/jobs/api/v1/listings/agency/${agencyId}/analytics/funnel`)
      .then((r) => r.data),

  bidWinRate: (agencyId: string, from: Date, to: Date) =>
    apiClient
      .get<BidWinRate>(`/jobs/api/v1/bids/agency/${agencyId}/analytics/win-rate`, {
        params: { from: from.toISOString(), to: to.toISOString() },
      })
      .then((r) => r.data),

  revenueOverTime: (agencyId: string, granularity: Granularity, from: Date, to: Date) =>
    apiClient
      .get<RevenueOverTimePoint[]>(`/payments/api/v1/payments/agency/${agencyId}/analytics/revenue-over-time`, {
        params: { granularity, from: from.toISOString(), to: to.toISOString() },
      })
      .then((r) => r.data),

  revenueTotals: (agencyId: string, rangeStart: Date, rangeEnd: Date, prevStart: Date, prevEnd: Date) =>
    apiClient
      .get<RevenueTotals>(`/payments/api/v1/payments/agency/${agencyId}/analytics/revenue-totals`, {
        params: {
          rangeStart: rangeStart.toISOString(),
          rangeEnd: rangeEnd.toISOString(),
          prevStart: prevStart.toISOString(),
          prevEnd: prevEnd.toISOString(),
        },
      })
      .then((r) => r.data),
};
