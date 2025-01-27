import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useTheme = create<ThemeState>((set) => ({
  isDarkMode: true,

  toggleTheme: async () => {
    set((state) => {
      const newMode = !state.isDarkMode;
      AsyncStorage.setItem('isDarkMode', JSON.stringify(newMode))
        .catch(error => console.error('Error saving theme:', error));
      return { isDarkMode: newMode };
    });
  },

  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('isDarkMode');
      if (savedTheme !== null) {
        set({ isDarkMode: JSON.parse(savedTheme) });
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  },
})); 