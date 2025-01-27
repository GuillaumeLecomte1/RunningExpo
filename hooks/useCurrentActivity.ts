import { create } from 'zustand';
import * as Location from 'expo-location';

// Points de la boucle autour de MDS Angers
const SIMULATION_POINTS = [
  { latitude: 47.478870, longitude: -0.563408 }, // MDS Angers
  { latitude: 47.479200, longitude: -0.563150 }, // Rue Lakanal
  { latitude: 47.479500, longitude: -0.563800 }, // Boulevard du Bon Pasteur
  { latitude: 47.479100, longitude: -0.564500 }, // Rue René Brémont
  { latitude: 47.478600, longitude: -0.564000 }, // Retour vers MDS
  { latitude: 47.478870, longitude: -0.563408 }, // MDS Angers (fin de boucle)
];

interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
}

interface CurrentActivityState {
  isActive: boolean;
  startTime: number | null;
  elapsedTime: number;
  pausedTime: number;
  lastPauseTime: number | null;
  distance: number;
  speed: number;
  calories: number;
  locations: LocationPoint[];
  locationSubscription: Location.LocationSubscription | null;
  timerInterval: ReturnType<typeof setInterval> | null;
  isSimulating: boolean;
  simulationInterval: ReturnType<typeof setInterval> | null;
  currentSimulationIndex: number;
  
  // Actions
  startActivity: () => Promise<void>;
  pauseActivity: () => void;
  resumeActivity: () => void;
  stopActivity: () => LocationPoint[];
  updateStats: (newLocation: LocationPoint) => void;
  updateTimer: () => void;
  startSimulation: () => void;
  stopSimulation: () => LocationPoint[];
}

export const useCurrentActivity = create<CurrentActivityState>((set, get) => ({
  isActive: false,
  startTime: null,
  elapsedTime: 0,
  pausedTime: 0,
  lastPauseTime: null,
  distance: 0,
  speed: 0,
  calories: 0,
  locations: [],
  locationSubscription: null,
  timerInterval: null,
  isSimulating: false,
  simulationInterval: null,
  currentSimulationIndex: 0,

  startActivity: async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission de localisation refusée');
    }

    // Obtenir la position initiale avec plusieurs tentatives si nécessaire
    let initialPosition = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (!initialPosition && attempts < maxAttempts) {
      try {
        initialPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation
        });
      } catch (error) {
        console.error(`Tentative ${attempts + 1}/${maxAttempts} échouée:`, error);
        attempts++;
        if (attempts < maxAttempts) {
          // Attendre 1 seconde avant de réessayer
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    if (!initialPosition) {
      throw new Error('Impossible d\'obtenir la position initiale');
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 5,
        timeInterval: 1000,
      },
      (location) => {
        const newLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
          accuracy: location.coords.accuracy || undefined,
          altitude: location.coords.altitude || undefined,
          speed: location.coords.speed || undefined,
        };
        
        const state = get();
        if (state.isActive) {
          state.updateStats(newLocation);
        }
      }
    );

    // Démarrer le timer
    const timer = setInterval(() => {
      const state = get();
      if (state.isActive) {
        state.updateTimer();
      }
    }, 1000);

    set({
      isActive: true,
      startTime: Date.now(),
      pausedTime: 0,
      lastPauseTime: null,
      locationSubscription: subscription,
      timerInterval: timer,
      locations: [{
        latitude: initialPosition.coords.latitude,
        longitude: initialPosition.coords.longitude,
        timestamp: initialPosition.timestamp,
        accuracy: initialPosition.coords.accuracy || undefined,
        altitude: initialPosition.coords.altitude || undefined,
        speed: initialPosition.coords.speed || undefined,
      }]
    });
  },

  startSimulation: () => {
    const state = get();
    if (state.isSimulating) return;

    // Arrêter le tracking normal s'il est actif
    if (state.locationSubscription) {
      state.locationSubscription.remove();
    }

    // Garder le timer existant ou en créer un nouveau
    let timer = state.timerInterval;
    if (!timer) {
      timer = setInterval(() => {
        const state = get();
        if (state.isActive) {
          state.updateTimer();
        }
      }, 1000);
    }

    // Sauvegarder la dernière position réelle
    const lastRealLocation = state.locations[state.locations.length - 1];

    // Créer un chemin complet
    const fullPath = [
      lastRealLocation || SIMULATION_POINTS[0],
      ...SIMULATION_POINTS,
    ];

    // Créer des points intermédiaires
    const interpolatedPath: LocationPoint[] = [];
    for (let i = 0; i < fullPath.length - 1; i++) {
      const start = fullPath[i];
      const end = fullPath[i + 1];
      const steps = 10;

      for (let step = 0; step <= steps; step++) {
        const progress = step / steps;
        interpolatedPath.push({
          latitude: start.latitude + (end.latitude - start.latitude) * progress,
          longitude: start.longitude + (end.longitude - start.longitude) * progress,
          timestamp: Date.now() + (i * steps + step) * 1000,
          accuracy: 10,
          speed: 3,
        });
      }
    }

    // Démarrer la simulation
    let currentIndex = 0;
    const simulationInterval = setInterval(() => {
      const state = get();
      if (!state.isActive || currentIndex >= interpolatedPath.length - 1) {
        // Arrêter la simulation une fois le trajet terminé
        state.stopSimulation();
        return;
      }

      const newLocation = interpolatedPath[currentIndex];
      state.updateStats(newLocation);
      currentIndex++;
      set({ currentSimulationIndex: currentIndex });
    }, 200);

    set(state => ({
      isActive: true,
      isSimulating: true,
      timerInterval: timer,
      simulationInterval,
      currentSimulationIndex: 0,
      startTime: state.startTime || Date.now(),
      locations: state.locations.length > 0 ? [...state.locations] : [interpolatedPath[0]]
    }));
  },

  stopSimulation: () => {
    const state = get();
    const { simulationInterval, locations } = state;
    
    if (simulationInterval) {
      clearInterval(simulationInterval);
    }

    // Redémarrer le tracking normal sans réinitialiser le chronomètre
    const startTrackingWithoutReset = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission de localisation refusée');
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 5,
          timeInterval: 1000,
        },
        (location) => {
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
            accuracy: location.coords.accuracy || undefined,
            altitude: location.coords.altitude || undefined,
            speed: location.coords.speed || undefined,
          };
          
          const state = get();
          state.updateStats(newLocation);
        }
      );

      set(state => ({
        isSimulating: false,
        simulationInterval: null,
        currentSimulationIndex: 0,
        locationSubscription: subscription,
        locations: [...state.locations] // Conserver l'historique des positions
      }));
    };

    startTrackingWithoutReset().catch(error => {
      console.error('Erreur lors de la reprise du tracking:', error);
    });
    
    return locations;
  },

  pauseActivity: () => {
    const { timerInterval } = get();
    
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    set({ 
      isActive: false,
      timerInterval: null,
      lastPauseTime: Date.now(),
    });
  },

  resumeActivity: () => {
    const state = get();
    const currentTime = Date.now();
    
    // Calculer le temps passé en pause
    if (state.lastPauseTime) {
      const additionalPausedTime = currentTime - state.lastPauseTime;
      set({ pausedTime: state.pausedTime + additionalPausedTime });
    }

    // Redémarrer le tracking si nécessaire
    const startTrackingIfNeeded = async () => {
      if (!state.locationSubscription) {
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 5,
            timeInterval: 1000,
          },
          (location) => {
            const newLocation = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: location.timestamp,
              accuracy: location.coords.accuracy || undefined,
              altitude: location.coords.altitude || undefined,
              speed: location.coords.speed || undefined,
            };
            
            const state = get();
            if (state.isActive) {
              state.updateStats(newLocation);
            }
          }
        );
        set({ locationSubscription: subscription });
      }
    };

    // Créer un nouveau timer si nécessaire
    const timer = setInterval(() => {
      const state = get();
      if (state.isActive) {
        state.updateTimer();
      }
    }, 1000);

    set({ 
      isActive: true,
      timerInterval: timer,
      lastPauseTime: null,
    });

    startTrackingIfNeeded().catch(error => {
      console.error('Erreur lors de la reprise du tracking:', error);
    });
  },

  stopActivity: () => {
    const state = get();
    const { locationSubscription, timerInterval, simulationInterval, locations } = state;
    
    if (locationSubscription) {
      locationSubscription.remove();
    }
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    if (simulationInterval) {
      clearInterval(simulationInterval);
    }

    set({
      isActive: false,
      isSimulating: false,
      startTime: null,
      elapsedTime: 0,
      distance: 0,
      speed: 0,
      calories: 0,
      locations: [],
      locationSubscription: null,
      timerInterval: null,
      simulationInterval: null,
      currentSimulationIndex: 0
    });

    return locations;
  },

  updateTimer: () => {
    set(state => {
      if (!state.startTime) return { elapsedTime: 0 };
      
      const currentTime = Date.now();
      const totalElapsedTime = currentTime - state.startTime - state.pausedTime;
      
      return {
        elapsedTime: Math.floor(totalElapsedTime / 1000)
      };
    });
  },

  updateStats: (newLocation: LocationPoint) => {
    set((state) => {
      const newLocations = [...state.locations, newLocation];
      
      // Calculer la distance
      let newDistance = state.distance;
      if (state.locations.length > 0) {
        const lastLocation = state.locations[state.locations.length - 1];
        const distanceIncrement = calculateDistance(
          lastLocation.latitude,
          lastLocation.longitude,
          newLocation.latitude,
          newLocation.longitude
        );
        newDistance += distanceIncrement;
      }

      // Calculer la vitesse (km/h)
      const newSpeed = newLocation.speed ? newLocation.speed * 3.6 : 0;

      // Calculer les calories (estimation simple)
      const newCalories = Math.floor(newDistance * 60);

      return {
        locations: newLocations,
        distance: newDistance,
        speed: newSpeed,
        calories: newCalories,
      };
    });
  },
}));

// Fonction utilitaire pour calculer la distance entre deux points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
} 