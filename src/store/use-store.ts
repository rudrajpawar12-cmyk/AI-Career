import { create } from 'zustand';

interface UserState {
  hasOnboarded: boolean;
  theme: 'dark' | 'light' | 'system';
  setOnboarded: (val: boolean) => void;
}

export const useStore = create<UserState>((set) => ({
  hasOnboarded: false, // In a real app this would persist
  theme: 'dark',
  setOnboarded: (val) => set({ hasOnboarded: val })
}));
