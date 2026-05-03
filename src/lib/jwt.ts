import type { JwtPayload } from '@/types';

/** Decodes the payload of a JWT without verifying its signature. Returns null on failure. */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Returns true if the token is expired or unparseable. */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload) return true;
  return payload.exp * 1000 <= Date.now();
}
