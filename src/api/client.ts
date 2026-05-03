import axios, { AxiosError, AxiosRequestConfig } from 'axios';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const ACCESS_KEY = 'deharri.accessToken';
const REFRESH_KEY = 'deharri.refreshToken';

export const tokenStore = {
  getAccess: (): string | null => localStorage.getItem(ACCESS_KEY),
  getRefresh: (): string | null => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Single-flight refresh: many requests racing on a 401 share one /auth/refresh call.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) {
    refreshing = (async () => {
      const refresh = tokenStore.getRefresh();
      if (!refresh) return null;
      try {
        const res = await axios.post(`${BASE_URL}/ums/api/v1/auth/refresh`, { token: refresh });
        const { accessToken, refreshToken } = res.data as { accessToken: string; refreshToken: string };
        tokenStore.set(accessToken, refreshToken);
        return accessToken;
      } catch {
        tokenStore.clear();
        return null;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

apiClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (err.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      const newAccess = await refreshAccessToken();
      if (newAccess) {
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization = `Bearer ${newAccess}`;
        return apiClient(original);
      }
    }
    return Promise.reject(err);
  },
);
