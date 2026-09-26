export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export function getBackendToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('sm_backend_token');
}

export function setBackendToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('sm_backend_token', token);
}

export function clearBackendToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('sm_backend_token');
}

export async function backendFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getBackendToken();
  const headers = new Headers(init.headers || {});

  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const data = await response.text();
  const payload = data ? JSON.parse(data) : null;

  if (!response.ok) {
    throw new Error(payload?.error || 'Request failed');
  }

  return payload as T;
}
