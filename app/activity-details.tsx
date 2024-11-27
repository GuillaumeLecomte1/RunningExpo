import { useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import { useActivities } from '@/hooks/useActivities';

// Importation conditionnelle de react-native-maps
const MapComponents = Platform.select({
  native: () => {
    const RNMaps = require('react-native-maps');
    return {
      MapView: RNMaps.default,
      Polyline: RNMaps.Polyline,
      Marker: RNMaps.Marker,
    };
  },
  default: () => ({
    MapView: null,
    Polyline: null,
    Marker: null,
  }),
})();

export default function ActivityDetailsScreen() {
  const params = useLocalSearchParams();
  const mapRef = useRef(null);
  const activities = useActivities((state) => state.activities);
  
  // Trouver l'activité correspondante
  const activity = activities.find(a => a.id === params.id);

  const MapComponent = () => {
    if (Platform.OS === 'web' || !MapComponents.MapView || !activity?.route) {
      return (
        <View style={styles.mapPlaceholder}>
          <ThemedText>Carte non disponible</ThemedText>
        </View>
      );
    }

    const { MapView, Polyline, Marker } = MapComponents;

    // Calculer les limites de la carte pour afficher tout le parcours
    const bounds = activity.route.reduce(
      (acc, point) => ({
        minLat: Math.min(acc.minLat, point.latitude),
        maxLat: Math.max(acc.maxLat, point.latitude),
        minLng: Math.min(acc.minLng, point.longitude),
        maxLng: Math.max(acc.maxLng, point.longitude),
      }),
      {
        minLat: Infinity,
        maxLat: -Infinity,
        minLng: Infinity,
        maxLng: -Infinity,
      }
    );

    const region = {
      latitude: (bounds.maxLat + bounds.minLat) / 2,
      longitude: (bounds.maxLng + bounds.minLng) / 2,
      latitudeDelta: (bounds.maxLat - bounds.minLat) * 1.2,
      longitudeDelta: (bounds.maxLng - bounds.minLng) * 1.2,
    };

    return (
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
      >
        <Polyline
          coordinates={activity.route}
          strokeColor="#6B5ECD"
          strokeWidth={3}
          lineDashPattern={[0]}
        />
        <Marker
          coordinate={activity.route[0]}
          title="Start"
          pinColor="green"
        />
        <Marker
          coordinate={activity.route[activity.route.length - 1]}
          title="Finish"
          pinColor="red"
        />
      </MapView>
    );
  };

  if (!activity) {
    return (
      <View style={styles.container}>
        <ThemedText>Activité non trouvée</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#6B5ECD', '#8B7FE8']}
        style={styles.header}
      >
        <ThemedText style={styles.date}>{activity.date}</ThemedText>
        <View style={styles.mainStats}>
          <ThemedText style={styles.distance}>{activity.distance} km</ThemedText>
          <ThemedText style={styles.duration}>{activity.duration}</ThemedText>
        </View>
      </LinearGradient>

      <View style={styles.mapContainer}>
        <MapComponent />
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <ThemedText style={styles.statValue}>{activity.calories}</ThemedText>
          <ThemedText style={styles.statLabel}>Calories</ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText style={styles.statValue}>{activity.speed}</ThemedText>
          <ThemedText style={styles.statLabel}>Avg Speed (km/h)</ThemedText>
        </View>
        {activity.stats && (
          <>
            <View style={styles.statCard}>
              <ThemedText style={styles.statValue}>
                {(activity.stats.maxSpeed || 0).toFixed(1)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Max Speed (km/h)</ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statValue}>
                {activity.stats.elevationGain || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Elevation (m)</ThemedText>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  date: {
    color: 'white',
    fontSize: 16,
    opacity: 0.8,
  },
  mainStats: {
    marginTop: 10,
  },
  distance: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  duration: {
    color: 'white',
    fontSize: 20,
    marginTop: 5,
  },
  mapContainer: {
    height: 300,
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B5ECD',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
}); 






