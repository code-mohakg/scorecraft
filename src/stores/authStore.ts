/**
 * Zustand Store for Authentication and User Management
 */

import { create } from 'zustand';
import { User, UserRole } from '@/types';
import { currentUserStorage, userStorage } from '@/lib/storage';

interface AuthStore {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (user: User) => Promise<void>;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: null,
  isAuthenticated: false,

  login: async (user: User) => {
    await userStorage.save(user);
    currentUserStorage.set(user);
    set({
      currentUser: user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    currentUserStorage.set(null);
    set({
      currentUser: null,
      isAuthenticated: false,
    });
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      currentUserStorage.set(user);
      set({
        currentUser: user,
        isAuthenticated: true,
      });
    } else {
      currentUserStorage.set(null);
      set({
        currentUser: null,
        isAuthenticated: false,
      });
    }
  },

  initializeAuth: () => {
    const user = currentUserStorage.get();
    set({
      currentUser: user,
      isAuthenticated: !!user,
    });
  },
}));
