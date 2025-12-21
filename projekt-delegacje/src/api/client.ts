import axios from 'axios';
import type { Delegacja, DelegacjaCreate, LoginRequest, LoginResponse } from './types';

// Bazowy klient HTTP dla całej aplikacji
export const api = axios.create({
  baseURL: 'https://localhost:7244', // adres Twojego backendu ASP.NET
  headers: {
    'Content-Type': 'application/json',
  },
});

// funkcja logowania
export const login = async (
  payload: LoginRequest,
): Promise<LoginResponse> => {
  const { data } = await api.post<LoginResponse>('/api/Auth/login', payload);
  return data;
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