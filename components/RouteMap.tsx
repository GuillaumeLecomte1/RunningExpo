import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import WebMapComponent from '@/app/WebMapComponent';

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

interface RouteMapProps {
  route: Array<{
    latitude: number;
    longitude: number;
  }>;
  height: number;
}

export default function RouteMap({ route, height }: RouteMapProps) {
  if (Platform.OS === 'web') {
    return <WebMapComponent />;
  }

  if (!MapView || !Polyline || !Marker || !route || route.length === 0) {
    return null;
  }

  // Calculer les limites du parcours
  const latitudes = route.map(point => point.latitude);
  const longitudes = route.map(point => point.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  // Calculer le centre
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // Calculer le delta avec une marge de 30%
  const latDelta = (maxLat - minLat) * 1.3 || 0.01;
  const lngDelta = (maxLng - minLng) * 1.3 || 0.01;

  // S'assurer que le zoom minimum est suffisant
  const minDelta = 0.005;
  const adjustedLatDelta = Math.max(latDelta, minDelta);
  const adjustedLngDelta = Math.max(lngDelta, minDelta);

  const startPoint = route[0];
  const endPoint = route[route.length - 1];

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: adjustedLatDelta,
          longitudeDelta: adjustedLngDelta,
        }}
        mapPadding={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <Polyline
          coordinates={route}
          strokeColor="#2D7CFF"
          strokeWidth={4}
          lineDashPattern={[0]}
          lineCap="round"
          lineJoin="round"
        />
        <Marker
          coordinate={startPoint}
          title="Start"
          pinColor="green"
        />
        <Marker
          coordinate={endPoint}
          title="Finish"
          pinColor="red"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 12,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
}); 