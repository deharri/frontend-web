import { apiClient } from './client';
import type { AuthResponse, LoginRequest } from '@/types';

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/ums/api/v1/auth/login', data).then((r) => r.data),

  logout: (refreshToken: string) =>
    apiClient
      .post<{ message: string }>('/ums/api/v1/auth/logout', { token: refreshToken })
      .then((r) => r.data),
};
