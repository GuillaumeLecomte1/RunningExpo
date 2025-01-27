import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Pressable, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import WebMapComponent from '@/app/WebMapComponent';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import { useActivities } from '@/hooks/useActivities';
import { useCurrentActivity } from '@/hooks/useCurrentActivity';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Importation conditionnelle de react-native-maps
const MapView = Platform.select({
  native: () => require('react-native-maps').default,
  default: () => null,
})();

const Polyline = Platform.select({
  native: () => require('react-native-maps').Polyline,
  default: () => null,
})();

const Marker = Platform.select({
  native: () => require('react-native-maps').Marker,
  default: () => null,
})();

// Composant carte conditionnel
const MapComponent = ({ mapRef, locations }: { mapRef: React.RefObject<any>, locations: any[] }) => {
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Vérifier et demander les permissions au chargement
    const checkPermissions = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission de localisation refusée');
        return;
      }

      // Obtenir la position initiale
      try {
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation
        });
        setIsMapReady(true);
      } catch (error) {
        console.error('Erreur lors de l\'obtention de la position initiale:', error);
      }
    };

    checkPermissions();
  }, []);

  useEffect(() => {
    if (locations.length > 0 && mapRef.current && isMapReady) {
      const lastLocation = locations[locations.length - 1];
      const region = {
        latitude: lastLocation.latitude,
        longitude: lastLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      mapRef.current.animateToRegion(region, 500);
    }
  }, [locations, isMapReady]);

  if (Platform.OS === 'web') {
    return <WebMapComponent />;
  }

  if (!MapView || !Polyline || !Marker || locations.length === 0 || !isMapReady) {
    return (
      <View style={[styles.map, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2D7CFF" />
      </View>
    );
  }

  const lastLocation = locations[locations.length - 1];

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      showsUserLocation={true}
      followsUserLocation={true}
      showsMyLocationButton={true}
      showsCompass={true}
      onMapReady={() => setIsMapReady(true)}
      region={{
        latitude: lastLocation.latitude,
        longitude: lastLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      mapPadding={{ top: 50, right: 50, bottom: 300, left: 50 }}
    >
      <Polyline
        coordinates={locations}
        strokeColor="#2D7CFF"
        strokeWidth={4}
        lineDashPattern={[0]}
        lineCap="round"
        lineJoin="round"
      />
    </MapView>
  );
};

export default function CurrentActivityScreen() {
  const mapRef = useRef(null);
  const addActivity = useActivities((state) => state.addActivity);
  const {
    isActive,
    startTime,
    elapsedTime,
    distance,
    speed,
    calories,
    locations,
    pauseActivity,
    resumeActivity,
    stopActivity,
    isSimulating,
    startSimulation,
    stopSimulation,
  } = useCurrentActivity();

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinishActivity = () => {
    // Arrêter l'activité et récupérer les locations finales
    const finalLocations = isSimulating ? stopSimulation() : stopActivity();
    
    // Filtrer les points pour ne garder que ceux avec une bonne précision
    const filteredLocations = finalLocations.filter(loc => !loc.accuracy || loc.accuracy <= 20);
    
    const newActivity = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      }),
      distance: distance.toFixed(2),
      duration: formatTime(elapsedTime),
      calories,
      speed: speed.toFixed(1),
      route: filteredLocations,
    };

    // Ajouter l'activité au store
    addActivity(newActivity);

    // Retourner à l'écran principal
    router.replace('/(tabs)');
  };

  const handleBackToHome = () => {
    // Retourner à l'écran principal sans arrêter l'activité
    router.replace('/(tabs)');
  };

  const toggleSimulation = () => {
    if (isSimulating) {
      stopSimulation();
    } else {
      startSimulation();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </Pressable>
      </View>

      <MapComponent mapRef={mapRef} locations={locations} />

      <View style={styles.statsContainer}>
        <LinearGradient 
          colors={['rgba(25, 25, 35, 0.95)', 'rgba(45, 45, 55, 0.95)']} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }} 
          style={styles.statsCard}
        >
          <View style={styles.timeContainer}>
            <ThemedText style={styles.timeText}>{formatTime(elapsedTime)}</ThemedText>
            <View style={styles.buttonContainer}>
              <Pressable
                style={styles.controlButton}
                onPress={() => isActive ? pauseActivity() : resumeActivity()}
              >
                <Ionicons 
                  name={isActive ? "pause" : "play"} 
                  size={32} 
                  color="white"
                  style={styles.controlIcon} 
                />
              </Pressable>
              <Pressable
                style={[styles.controlButton, isSimulating && styles.simulateButtonActive]}
                onPress={toggleSimulation}
              >
                <Ionicons 
                  name={isSimulating ? "stop" : "refresh"} 
                  size={32} 
                  color="white"
                  style={styles.controlIcon} 
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{distance.toFixed(1)}</ThemedText>
              <ThemedText style={styles.statLabel}>km</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{calories}</ThemedText>
              <ThemedText style={styles.statLabel}>kcal</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{speed.toFixed(1)}</ThemedText>
              <ThemedText style={styles.statLabel}>km/h</ThemedText>
            </View>
          </View>
        </LinearGradient>
      </View>

      <Pressable
        style={styles.finishButton}
        onPress={handleFinishActivity}
      >
        <ThemedText style={styles.finishButtonText}>Finish</ThemedText>
        <Ionicons name="checkmark" size={24} color="white" style={styles.finishIcon} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  map: {
    flex: 1,
    marginTop: -30,
  },
  statsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
  },
  statsCard: {
    borderRadius: 30,
    padding: 25,
    backgroundColor: 'rgba(25, 25, 35, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  timeText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'sans-serif-medium' }),
    letterSpacing: 1,
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  controlIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  simulateButtonActive: {
    backgroundColor: 'rgba(255, 59, 48, 0.3)',
    borderColor: 'rgba(255, 59, 48, 0.5)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 5,
  },
  statValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Pro Display', android: 'sans-serif-medium' }),
    textShadowColor: 'rgba(255, 255, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  finishButton: {
    height: 70,
    marginHorizontal: 20,
    backgroundColor: '#2D7CFF',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 35,
    left: 0,
    right: 0,
    shadowColor: "#2D7CFF",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    gap: 10,
  },
  finishButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: '600',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  finishIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(25, 25, 35, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: '400',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 28,
  },
  currentLocationMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2D7CFF',
    borderWidth: 3,
    borderColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


