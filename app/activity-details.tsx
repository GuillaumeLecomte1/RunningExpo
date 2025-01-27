import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Platform, Pressable, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import WebMapComponent from '@/app/WebMapComponent';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import { useBadges } from '@/hooks/useBadges';
import RouteMap from '@/components/RouteMap';
import { Ionicons } from '@expo/vector-icons';
import { useActivities } from '@/hooks/useActivities';

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

export default function ActivityDetailsScreen() {
  const params = useLocalSearchParams();
  const activities = useActivities((state) => state.activities);
  const { unlockedBadges } = useBadges();
  
  // Récupérer l'activité soit depuis le store (pour les badges), soit depuis les paramètres
  const activity = React.useMemo(() => {
    // Si on vient des badges (on a juste l'ID), chercher l'activité complète dans le store
    if (params.id && !params.route) {
      const foundActivity = activities.find(a => a.id === params.id);
      if (foundActivity) {
        return foundActivity;
      }
    }
    
    // Sinon utiliser les paramètres (venant de la liste des activités)
    return {
      id: params.id as string,
      date: params.date as string,
      distance: params.distance as string,
      duration: params.duration as string,
      calories: Number(params.calories),
      speed: params.speed as string,
      route: params.route ? JSON.parse(params.route as string) : [],
    };
  }, [params, activities]);

  // Récupérer les badges débloqués pour cette activité
  const activityBadges = React.useMemo(() => {
    return unlockedBadges.filter(badge => badge.activityId === activity.id);
  }, [unlockedBadges, activity.id]);

  // Vérifier si la route est valide
  const hasValidRoute = Array.isArray(activity.route) && activity.route.length > 0 &&
    activity.route.every(point => 
      typeof point === 'object' && 
      typeof point.latitude === 'number' && 
      typeof point.longitude === 'number'
    );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Activity Details</ThemedText>
        </View>

        <LinearGradient colors={['#6B5ECD', '#8B7FE8']} style={styles.card}>
          <ThemedText style={styles.title}>{activity.date}</ThemedText>
          
          {hasValidRoute && <RouteMap route={activity.route} height={200} />}
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{activity.distance}</ThemedText>
              <ThemedText style={styles.statLabel}>km</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{activity.duration}</ThemedText>
              <ThemedText style={styles.statLabel}>duration</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{activity.calories}</ThemedText>
              <ThemedText style={styles.statLabel}>kcal</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{activity.speed}</ThemedText>
              <ThemedText style={styles.statLabel}>km/h</ThemedText>
            </View>
          </View>

          {activityBadges.length > 0 && (
            <View style={styles.badgesSection}>
              <ThemedText style={styles.badgesTitle}>Badges Earned</ThemedText>
              <View style={styles.badgesContainer}>
                {activityBadges.map((badge) => (
                  <View key={badge.id} style={styles.badgeItem}>
                    <ThemedText style={styles.badgeIcon}>{badge.icon}</ThemedText>
                    <ThemedText style={styles.badgeName}>{badge.name}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  card: {
    margin: 16,
    marginTop: 8,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  badgesSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
  },
  badgesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 90,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  badgeName: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 64,
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 24,
  },
  modalCloseButton: {
    backgroundColor: '#2D7CFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 














