import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export interface Activity {
  id: string;
  date: string;
  distance: string;
  duration: string;
  calories: number;
  speed: string;
  route?: Array<{
    latitude: number;
    longitude: number;
    timestamp: number;
  }>;
}

interface ActivitiesState {
  activities: Activity[];
  addActivity: (activity: Activity) => Promise<void>;
  loadActivities: () => Promise<void>;
}

export const useActivities = create<ActivitiesState>((set) => ({
  activities: [],
  
  addActivity: async (activity: Activity) => {
    set((state) => {
      const newActivities = [activity, ...state.activities];
      // Sauvegarder dans AsyncStorage
      AsyncStorage.setItem('activities', JSON.stringify(newActivities))
        .catch(error => console.error('Error saving activities:', error));
      return { activities: newActivities };
    });
  },

  loadActivities: async () => {
    try {
      const stored = await AsyncStorage.getItem('activities');
      if (stored) {
        set({ activities: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  },
}));

// Hook pour charger les activités au démarrage
export function useInitializeActivities() {
  const loadActivities = useActivities((state) => state.loadActivities);
  
  useEffect(() => {
    loadActivities();
  }, []);
} 