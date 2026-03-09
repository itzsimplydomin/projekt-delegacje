import axios from 'axios';
import type {
  Delegacja,
  DelegacjaCreate,
  LoginRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from './types';

// ── Klient axios ──────────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL:
    'https://delegacjeartikon-ebfdgjgwesagfzha.polandcentral-01.azurewebsites.net',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Token helpers ─────────────────────────────────────────────────────────────

export const getToken = (): string | null =>
  localStorage.getItem('token') ?? sessionStorage.getItem('token');

export const setToken = (token: string, remember: boolean): void => {
  if (remember) {
    localStorage.setItem('token', token);
    sessionStorage.removeItem('token');
  } else {
    sessionStorage.setItem('token', token);
    localStorage.removeItem('token');
  }
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

// ── Interceptor: dodaj token do każdego żądania ───────────────────────────────

api.interceptors.request.use((config) => {
  if (config.url?.includes('/api/Auth/login')) return config;

  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── Interceptor: obsługa 401 ──────────────────────────────────────────────────
//
// Gdy serwer zwróci 401 (token wygasł lub nieważny), czyścimy storage
// i przekierowujemy na stronę logowania.
// Używamy eventu zamiast bezpośredniego importu navigate, żeby uniknąć
// cyklicznych zależności między client.ts a AuthContext.tsx.

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      // Emituj zdarzenie — AuthContext i RequireAuth nasłuchują
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * Logowanie: wysyła żądanie i zwraca surowy token.
 * Zapis tokena do storage i aktualizacja kontekstu leżą po stronie AuthContext.
 */
export const loginRequest = async (
  payload: LoginRequest,
): Promise<string> => {
  const { data } = await api.post<{ token: string }>('/api/Auth/login', payload);
  return data.token;
};

/** @deprecated Użyj loginRequest + useAuth().login */
export const login = async (
  payload: LoginRequest,
  remember = false,
): Promise<{ success: boolean; message: string }> => {
  removeToken();
  const token = await loginRequest(payload);
  setToken(token, remember);
  return { success: true, message: 'Zalogowano pomyślnie' };
};

export const changePassword = async (
  payload: ChangePasswordRequest,
): Promise<ChangePasswordResponse> => {
  try {
    const { data } = await api.post<{ success: boolean }>(
      '/api/Auth/change-password',
      payload,
    );
    return { success: data.success, message: 'Hasło zostało pomyślnie zmienione' };
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      (error as { response?: { data?: unknown } }).response?.data
    ) {
      throw new Error(String((error as { response: { data: unknown } }).response.data));
    }
    throw new Error('Nie udało się zmienić hasła');
  }
};

// ── Delegacje ─────────────────────────────────────────────────────────────────

export const getDelegacje = async (): Promise<Delegacja[]> => {
  const { data } = await api.get<Delegacja[]>('/api/Delegacje');
  return data;
};

export const createDelegacja = async (payload: DelegacjaCreate): Promise<void> => {
  await api.post('/api/Delegacje', payload);
};

export const deleteDelegacja = async (id: string): Promise<void> => {
  await api.delete(`/api/Delegacje/${id}`);
};

export const updateDelegacja = async (
  id: string,
  payload: Partial<DelegacjaCreate>,
): Promise<void> => {
  await api.put(`/api/Delegacje/${id}`, payload);
};

export const generatePdf = async (id: string): Promise<void> => {
  const response = await api.post(`/api/Delegacje/${id}/pdf`, null, {
    responseType: 'blob',
  });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `delegacja-${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const generateMonthlyPdf = async (params: {
  year: number;
  month: number;
  userEmail?: string;
}): Promise<Blob> => {
  const searchParams = new URLSearchParams({
    year: params.year.toString(),
    month: params.month.toString(),
  });
  if (params.userEmail) searchParams.append('userEmail', params.userEmail);

  const response = await api.post(
    `/api/Delegacje/monthly-pdf?${searchParams.toString()}`,
    null,
    { responseType: 'blob' },
  );
  return response.data as Blob;
};

// ── Deprecated helper (zastąpiony przez useAuth().isAdmin) ───────────────────

/** @deprecated Użyj useAuth().isAdmin */
export const isAdmin = (): boolean => {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ===
      'Admin'
    );
  } catch {
    return false;
  }
};