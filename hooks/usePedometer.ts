import { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

export const usePedometer = () => {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);
  const [stepCount, setStepCount] = useState(0);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const subscribe = async () => {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(isAvailable);

        if (isAvailable) {
          if (Platform.OS === 'ios') {
            // Sur iOS, on peut obtenir les pas depuis minuit
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            
            const result = await Pedometer.getStepCountAsync(start, end);
            if (result) {
              setStepCount(result.steps);
            }
          }

          // Sur Android, on commence simplement à compter à partir de maintenant
          subscription = Pedometer.watchStepCount(result => {
            if (Platform.OS === 'ios') {
              // Sur iOS, on met à jour avec le total depuis minuit
              setStepCount(prevCount => prevCount + result.steps);
            } else {
              // Sur Android, on incrémente simplement le compteur
              setStepCount(prevCount => prevCount + 1);
            }
          });
        }
      } catch (error) {
        console.error('Erreur du podomètre:', error);
        // En cas d'erreur, on marque le podomètre comme non disponible
        setIsPedometerAvailable(false);
      }
    };

    subscribe();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return {
    isPedometerAvailable,
    stepCount
  };
}; 