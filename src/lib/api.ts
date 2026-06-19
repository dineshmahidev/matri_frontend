export const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'https://matriback.90skalyanam.com/api';

const DEFAULT_TIMEOUT = 30_000; // 30 seconds
const MAX_RETRIES = 1;

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ungalkalyanam_token');
}

function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ungalkalyanam_token');
  localStorage.removeItem('ungalkalyanam_user');
}

async function fetchWithRetry(url: string, options: RequestInit, retriesLeft: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // Don't retry on client errors (4xx) — only on server errors (5xx) or network issues
    if (!response.ok && retriesLeft > 0 && response.status >= 500) {
      return fetchWithRetry(url, options, retriesLeft - 1);
    }

    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Retry on network errors or timeouts
    if (retriesLeft > 0 && (error.name === 'AbortError' || error.name === 'TypeError')) {
      await new Promise((r) => setTimeout(r, 500));
      return fetchWithRetry(url, options, retriesLeft - 1);
    }

    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }

    throw new Error(error.message || 'Network error. Please check your connection.');
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> || {}),
  };
  // Never allow manual Content-Type with FormData — the browser must set it (with boundary)
  if (isFormData) delete headers['Content-Type'];

  const url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetchWithRetry(url, { ...options, headers }, MAX_RETRIES);

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      console.warn('[api] 401 received — token may be invalid or expired');
    }

    let errorData = null;
    try {
      errorData = await response.json();
    } catch (_) {
      // Ignored — response may not be JSON
    }
    throw new Error(
      errorData?.message || errorData?.error || `Request failed (${response.status})`
    );
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { method: 'GET', ...options }),
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
      ...options,
    }),
  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
      ...options,
    }),
  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { method: 'DELETE', ...options }),
};
