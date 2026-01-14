import axios from 'axios';
import type { Delegacja, DelegacjaCreate, LoginRequest, ChangePasswordRequest, ChangePasswordResponse} from './types';

// Bazowy klient HTTP dla całej aplikacji
export const api = axios.create({
  baseURL: 'https://delegacjeartikon-ebfdgjgwesagfzha.polandcentral-01.azurewebsites.net', // adres backendu ASP.NET
  headers: {
    'Content-Type': 'application/json',
  },
});

// interceptor dodający token do nagłówków żądań
api.interceptors.request.use((config) => {
  if (config.url?.includes('/api/Auth/login')) {
    return config;
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// funkcja logowania dodanie tokena
export const login = async (payload: LoginRequest) => {
  localStorage.removeItem('token'); 

  const { data } = await api.post<{ token: string }>(
    '/api/Auth/login',
    payload
  );

  localStorage.setItem('token', data.token);

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

export const isAdmin = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Admin';
  } catch {
    return false;
  }
};
