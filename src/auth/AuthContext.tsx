import { createContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { tokenStore } from '@/api/client';
import { decodeJwt, isTokenExpired } from '@/lib/jwt';
import { queryClient } from '@/lib/queryClient';
import type { JwtPayload, LoginRequest } from '@/types';

interface AuthContextValue {
  isAuthenticated: boolean;
  user: { userId: string; username: string; roles: string[] } | null;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthContextValue['user']>(() => userFromToken());

  const refreshUserFromToken = useCallback(() => {
    setUser(userFromToken());
  }, []);

  // Sync across tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'deharri.accessToken') refreshUserFromToken();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refreshUserFromToken]);

  const login = async (data: LoginRequest) => {
    const res = await authApi.login(data);
    tokenStore.set(res.accessToken, res.refreshToken);
    refreshUserFromToken();
  };

  const logout = async () => {
    const refresh = tokenStore.getRefresh();
    if (refresh) {
      try { await authApi.logout(refresh); } catch { /* best-effort */ }
    }
    tokenStore.clear();
    queryClient.clear();
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value: AuthContextValue = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function userFromToken(): AuthContextValue['user'] {
  const token = tokenStore.getAccess();
  if (!token || isTokenExpired(token)) return null;
  const payload = decodeJwt(token) as JwtPayload | null;
  if (!payload) return null;
  return { userId: payload.userId, username: payload.sub, roles: payload.roles };
}
