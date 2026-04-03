'use client';

import { create } from 'zustand';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: Record<string, string>) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('accessToken', data.accessToken);
      await useAuthStore.getState().fetchMe();
    } catch (error) {
      localStorage.removeItem('accessToken');
      set({ user: null });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('accessToken', data.accessToken);
      await useAuthStore.getState().fetchMe();
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMe: async () => {
    const { data } = await api.get('/auth/me');
    set({ user: data });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null });
  },
}));