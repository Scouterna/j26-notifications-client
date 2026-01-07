import { config, requirePlatformBaseUrl } from '../config';
import type { ApiError, SessionUser } from '../types';

type FetchOptions = RequestInit & {
  skipJson?: boolean;
};

function buildUrl(path: string): string {
  const baseUrl = requirePlatformBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

async function refreshSession(): Promise<boolean> {
  try {
    const response = await fetch(buildUrl('/auth/refresh'), {
      method: 'GET',
      credentials: 'include',
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to refresh session', error);
    return false;
  }
}

function redirectToLogin(): never {
  const redirectTarget =
    typeof window !== 'undefined' && window.location.href ? window.location.href : 'about:blank';
  const redirectUri = encodeURIComponent(redirectTarget);
  window.location.assign(`${buildUrl('/auth/login')}?redirect_uri=${redirectUri}`);
  throw new Error('Redirecting to login');
}

async function parseError(res: Response): Promise<ApiError> {
  const message = await res.text();
  return {
    status: res.status,
    message: message || res.statusText,
  };
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}, hasRetried = false): Promise<T | undefined> {
  const url = path.startsWith('http') ? path : buildUrl(path);
  const headers = new Headers(options.headers || undefined);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    credentials: 'include',
    headers,
    ...options,
  });

  if (response.status === 401 && !hasRetried) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiFetch<T>(path, options, true);
    }
    redirectToLogin();
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (options.skipJson || response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function getCurrentUser(): Promise<SessionUser> {
  const result = await apiFetch<SessionUser>('/auth/user', { method: 'GET' });
  if (!result) {
    throw new Error('No session user');
  }
  return result;
}
