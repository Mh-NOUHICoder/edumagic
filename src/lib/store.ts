import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  xp: number;
  level: number;
  streak: number;
  language: 'en' | 'ar' | 'fr';
  addXP: (amount: number) => void;
  setLevel: (level: number) => void;
  updateStreak: (streak: number) => void;
  setLanguage: (lang: 'en' | 'ar' | 'fr') => void;
}

export const useStore = create<UserState>()(
  persist(
    (set) => ({
      xp: 0,
      level: 1,
      streak: 0,
      language: 'en',
      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
      setLevel: (level) => set({ level }),
      updateStreak: (streak) => set({ streak }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'edumagic-storage',
    }
  )
);
