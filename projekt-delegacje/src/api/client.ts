import axios from 'axios';
import type { Delegacja, DelegacjaCreate, LoginRequest, LoginResponse } from './types';

// Bazowy klient HTTP dla całej aplikacji
export const api = axios.create({
  baseURL: 'https://localhost:7244', // adres Twojego backendu ASP.NET
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// funkcja logowania dodanie tokena
export const login = async (
  payload: LoginRequest,
): Promise<{ success: boolean; message?: string }> => {
  const { data } = await api.post<{ token: string }>(
    '/api/Auth/login',
    payload,
  );

  localStorage.setItem('token', data.token);

  return {
    success: true,
    message: 'Zalogowano pomyślnie',
  };
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