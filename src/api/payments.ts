import { apiClient } from './client';
import type { PaymentTransaction } from '@/types';

export const paymentsApi = {
  /** All transactions where the agency is the recipient. */
  getAgencyPayments: (agencyId: string) =>
    apiClient
      .get<PaymentTransaction[]>(`/payments/api/v1/payments/agency/${agencyId}`)
      .then((r) => r.data),
};
