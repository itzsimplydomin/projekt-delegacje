import axios from 'axios';
import type { Delegacja, DelegacjaCreate, LoginRequest, ChangePasswordRequest, ChangePasswordResponse } from './types';

export const api = axios.create({
  baseURL: 'https://delegacjeartikon-ebfdgjgwesagfzha.polandcentral-01.azurewebsites.net',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Pomocnicze funkcje do zarządzania tokenem
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

// interceptor dodający token do nagłówków żądań
api.interceptors.request.use((config) => {
  if (config.url?.includes('/api/Auth/login')) {
    return config;
  }

  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// funkcja logowania
export const login = async (payload: LoginRequest, remember: boolean = false) => {
  removeToken();

  const { data } = await api.post<{ token: string }>(
    '/api/Auth/login',
    payload
  );

  setToken(data.token, remember);

  return {
    success: true,
    message: 'Zalogowano pomyślnie',
  };
};

// funkcja zmiany hasła
export const changePassword = async (
  payload: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  try {
    const { data } = await api.post<{ success: boolean }>(
      '/api/Auth/change-password',
      payload
    );

    return {
      success: data.success,
      message: 'Hasło zostało pomyślnie zmienione',
    };
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    throw new Error('Nie udało się zmienić hasła');
  }
};

// pobranie listy delegacji
export const getDelegacje = async (): Promise<Delegacja[]> => {
  const { data } = await api.get<Delegacja[]>('/api/Delegacje');
  return data;
};

// dodanie nowej delegacji
export const createDelegacja = async (payload: DelegacjaCreate): Promise<void> => {
  await api.post('/api/Delegacje', payload);
};

// usunięcie delegacji
export const deleteDelegacja = async (id: string): Promise<void> => {
  await api.delete(`/api/Delegacje/${id}`);
};

// edycja delegacji
export const updateDelegacja = async (
  id: string,
  payload: Partial<DelegacjaCreate>
): Promise<void> => {
  await api.put(`/api/Delegacje/${id}`, payload);
};

// generowanie PDF
export const generatePdf = async (id: string) => {
  const response = await api.post(
    `/api/Delegacje/${id}/pdf`,
    null,
    { responseType: 'blob' }
  );

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

// Generowanie miesięcznego PDF
export const generateMonthlyPdf = async (params: {
  year: number;
  month: number;
  userEmail?: string;
}): Promise<Blob> => {
  const searchParams = new URLSearchParams({
    year: params.year.toString(),
    month: params.month.toString(),
  });

  if (params.userEmail) {
    searchParams.append('userEmail', params.userEmail);
  }

  const response = await api.post(
    `/api/Delegacje/monthly-pdf?${searchParams.toString()}`,
    null,
    { responseType: 'blob' }
  );

  return response.data as Blob;
};

// Sprawdzanie czy użytkownik ma rolę Admin
export const isAdmin = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Admin';
  } catch {
    return false;
  }
};