/**
 * TuxedoPOS API Client
 * Thin wrapper around fetch — handles auth headers, base URL, and error parsing.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

function getToken(): string | null {
  try {
    const session = localStorage.getItem('tuxedopos_session');
    if (!session) {return null;}
    const parsed = JSON.parse(session) as { access_token?: string };
    return parsed.access_token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { status: res.status } }));
    }
    const err = await res.json().catch(() => ({ message: res.statusText })) as { message: string };
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) {return undefined as T;}
  return res.json() as Promise<T>;
}

export const apiClient = {
  get:    <T>(path: string)                   => request<T>(path),
  post:   <T>(path: string, body: unknown)    => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)    => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  <T>(path: string, body?: unknown)   => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string)                   => request<T>(path, { method: 'DELETE' }),
};
