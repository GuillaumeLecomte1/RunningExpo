import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity } from './useActivities';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (activity: Activity) => boolean;
  unlockedAt?: string;
  activityId?: string;
}

interface BadgeState {
  unlockedBadges: Badge[];
  checkActivityForBadges: (activity: Activity) => Badge[];
  loadBadges: () => Promise<void>;
}

// Définition des badges disponibles
export const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'first_run',
    name: 'First Steps',
    description: 'Complete your first running activity',
    icon: '🎯',
    condition: () => true,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Maintain an average speed above 12 km/h',
    icon: '⚡',
    condition: (activity) => parseFloat(activity.speed) > 12,
  },
  {
    id: 'distance_5k',
    name: '5K Champion',
    description: 'Complete a 5 kilometer run',
    icon: '🏃',
    condition: (activity) => parseFloat(activity.distance) >= 5,
  },
  {
    id: 'distance_10k',
    name: '10K Master',
    description: 'Complete a 10 kilometer run',
    icon: '🏆',
    condition: (activity) => parseFloat(activity.distance) >= 10,
  },
  {
    id: 'calorie_burner',
    name: 'Calorie Burner',
    description: 'Burn more than 500 calories in one session',
    icon: '🔥',
    condition: (activity) => activity.calories > 500,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Start a run before 7 AM',
    icon: '🌅',
    condition: (activity) => {
      const activityDate = new Date(activity.date);
      const hour = activityDate.getHours();
      return hour < 7;
    },
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a run after 8 PM',
    icon: '🌙',
    condition: (activity) => {
      const activityDate = new Date(activity.date);
      const hour = activityDate.getHours();
      return hour >= 20;
    },
  },
  {
    id: 'endurance',
    name: 'Endurance Master',
    description: 'Run for more than 1 hour',
    icon: '🏃',
    condition: (activity) => {
      const [hours, minutes] = activity.duration.split(':');
      const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
      return totalMinutes >= 60;
    },
  },
];

export const useBadges = create<BadgeState>((set, get) => ({
  unlockedBadges: [],

  checkActivityForBadges: (activity: Activity) => {
    const newBadges: Badge[] = [];
    const currentUnlockedBadges = get().unlockedBadges;

    AVAILABLE_BADGES.forEach(badge => {
      // Vérifier si le badge n'est pas déjà débloqué
      const isAlreadyUnlocked = currentUnlockedBadges.some(b => b.id === badge.id);
      
      if (!isAlreadyUnlocked && badge.condition(activity)) {
        const newBadge: Badge = {
          ...badge,
          unlockedAt: new Date().toISOString(),
          activityId: activity.id,
        };
        newBadges.push(newBadge);
      }
    });

    if (newBadges.length > 0) {
      const updatedBadges = [...currentUnlockedBadges, ...newBadges];
      set({ unlockedBadges: updatedBadges });
      
      // Sauvegarder dans AsyncStorage
      AsyncStorage.setItem('badges', JSON.stringify(updatedBadges))
        .catch(error => console.error('Error saving badges:', error));
    }

    return newBadges;
  },

  loadBadges: async () => {
    try {
      const stored = await AsyncStorage.getItem('badges');
      if (stored) {
        set({ unlockedBadges: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  },
})); 