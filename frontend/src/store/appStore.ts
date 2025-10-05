import { create } from 'zustand';

interface AppState {
  token: string | null;
  deviceFingerprint: string | null;
  userLocation: { lat: number; lng: number } | null;
  isInVolusia: boolean;
  setToken: (token: string) => void;
  setDeviceFingerprint: (fingerprint: string) => void;
  setUserLocation: (location: { lat: number; lng: number }) => void;
  setIsInVolusia: (inVolusia: boolean) => void;
  clearAuth: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  token: localStorage.getItem('auth_token'),
  deviceFingerprint: null,
  userLocation: null,
  isInVolusia: false,

  setToken: (token) => {
    localStorage.setItem('auth_token', token);
    set({ token });
  },

  setDeviceFingerprint: (fingerprint) => {
    set({ deviceFingerprint: fingerprint });
  },

  setUserLocation: (location) => {
    set({ userLocation: location });
  },

  setIsInVolusia: (inVolusia) => {
    set({ isInVolusia: inVolusia });
  },

  clearAuth: () => {
    localStorage.removeItem('auth_token');
    set({ token: null, userLocation: null, isInVolusia: false });
  },
}));
