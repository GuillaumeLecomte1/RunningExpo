import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { useActivities } from '@/hooks/useActivities';
import { useCurrentActivity } from '@/hooks/useCurrentActivity';
import { usePedometer } from '@/hooks/usePedometer';
import RouteMap from '@/components/RouteMap';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

interface Activity {
  id: string;
  date: string;
  duration: string;
  distance: string;
  calories: number;
  speed: string;
  route?: Array<{
    latitude: number;
    longitude: number;
  }>;
}

export default function TabOneScreen() {
  const activities = useActivities((state) => state.activities);
  const { 
    isActive, 
    elapsedTime, 
    distance, 
    calories, 
    speed,
    startActivity,
    stopActivity 
  } = useCurrentActivity();
  const { stepCount, isPedometerAvailable } = usePedometer();
  const [weeklyDistance, setWeeklyDistance] = useState(0);
  const [weeklyGoal] = useState(20); // 20km par semaine comme objectif
  const [isWeeklyGoalAchieved, setIsWeeklyGoalAchieved] = useState(false);

  // Arrêter toute activité en cours au montage du composant
  useEffect(() => {
    if (isActive) {
      stopActivity();
    }
  }, []);

  useEffect(() => {
    // Calculer la distance totale de la semaine
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Dimanche = 0
    startOfWeek.setHours(0, 0, 0, 0);

    const weekDistance = activities.reduce((total, activity) => {
      // Convertir la date de l'activité (format "Month Day") en objet Date
      const [month, day] = activity.date.split(' ');
      const activityDate = new Date(now.getFullYear(), getMonthNumber(month), parseInt(day));
      
      if (activityDate >= startOfWeek) {
        return total + parseFloat(activity.distance);
      }
      return total;
    }, 0);

    // Ajouter la distance de l'activité en cours si elle existe
    const totalDistance = weekDistance + (isActive ? distance : 0);
    setWeeklyDistance(totalDistance);
    setIsWeeklyGoalAchieved(totalDistance >= weeklyGoal);
  }, [activities, isActive, distance]);

  // Fonction utilitaire pour convertir le nom du mois en numéro
  const getMonthNumber = (monthName: string): number => {
    const months: { [key: string]: number } = {
      'January': 0,
      'February': 1,
      'March': 2,
      'April': 3,
      'May': 4,
      'June': 5,
      'July': 6,
      'August': 7,
      'September': 8,
      'October': 9,
      'November': 10,
      'December': 11
    };
    return months[monthName] || 0;
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleActivityPress = () => {
    if (isActive) {
      router.push('/current-activity');
    }
  };

  const handleStartNewActivity = async () => {
    try {
      await startActivity();
      router.push('/current-activity');
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'activité:', error);
    }
  };

  const handleRecentActivityPress = (activity: Activity) => {
    router.push({
      pathname: '/activity-details',
      params: {
        id: activity.id,
        date: activity.date,
        duration: activity.duration,
        distance: activity.distance,
        calories: activity.calories,
        speed: activity.speed,
        route: JSON.stringify(activity.route),
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      {isActive ? (
        <Pressable onPress={handleActivityPress}>
          <LinearGradient colors={['#6B5ECD', '#8B7FE8']} style={styles.card}>
            <ThemedText style={styles.cardTitle}>Current Jogging</ThemedText>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{formatTime(elapsedTime)}</ThemedText>
                <ThemedText style={styles.statLabel}>Duration</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{distance.toFixed(2)}</ThemedText>
                <ThemedText style={styles.statLabel}>km</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{calories}</ThemedText>
                <ThemedText style={styles.statLabel}>kcal</ThemedText>
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      ) : (
        <Pressable onPress={handleStartNewActivity}>
          <LinearGradient colors={['#6B5ECD', '#8B7FE8']} style={styles.startActivityCard}>
            <View style={styles.startActivityContent}>
              <ThemedText style={styles.startActivityIcon}>🏃</ThemedText>
              <ThemedText style={styles.startActivityText}>Start New Activity</ThemedText>
            </View>
          </LinearGradient>
        </Pressable>
      )}

      <LinearGradient 
        colors={isWeeklyGoalAchieved ? ['#4CAF50', '#81C784'] : ['#6B5ECD', '#8B7FE8']} 
        style={styles.card}
      >
        <View style={styles.cardTitleContainer}>
          <ThemedText style={styles.cardTitle}>Week Goals</ThemedText>
          {isWeeklyGoalAchieved && (
            <View style={[styles.achievementBadge, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
              <ThemedText style={styles.achievementIcon}>✅</ThemedText>
            </View>
          )}
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min((weeklyDistance / weeklyGoal) * 100, 100)}%`,
                  backgroundColor: isWeeklyGoalAchieved ? '#E8F5E9' : 'white'
                }
              ]} 
            />
          </View>
          <ThemedText style={styles.progressText}>
            {weeklyDistance.toFixed(1)} / {weeklyGoal} km
          </ThemedText>
        </View>
      </LinearGradient>

      <LinearGradient colors={['#6B5ECD', '#8B7FE8']} style={styles.card}>
        <ThemedText style={styles.cardTitle}>Daily Steps</ThemedText>
        <View style={styles.stepsContainer}>
          <ThemedText style={styles.stepsCount}>
            {isPedometerAvailable ? stepCount.toLocaleString() : 'Not available'}
          </ThemedText>
          <ThemedText style={styles.stepsLabel}>steps today</ThemedText>
        </View>
      </LinearGradient>

      <View style={styles.recentActivities}>
        <ThemedText style={styles.sectionTitle}>Recent Activities</ThemedText>
        {activities.length === 0 ? (
          <LinearGradient colors={['#6B5ECD', '#8B7FE8']} style={styles.emptyStateCard}>
            {/* <ThemedText style={styles.emptyStateIcon}>🏃</ThemedText> */}
            <ThemedText style={styles.emptyStateTitle}>No activities yet</ThemedText>
            <ThemedText style={styles.emptyStateText}>Start running to track your activities and earn badges!</ThemedText>
          </LinearGradient>
        ) : (
          activities.slice(0, 3).map((activity, index) => (
            <Pressable key={index} onPress={() => handleRecentActivityPress(activity)}>
              <LinearGradient colors={['#6B5ECD', '#8B7FE8']} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <ThemedText style={styles.activityDate}>{activity.date}</ThemedText>
                  <ThemedText style={styles.activityDuration}>{activity.duration}</ThemedText>
                </View>
                {activity.route && <RouteMap route={activity.route} height={150} />}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statValue}>{activity.distance}</ThemedText>
                    <ThemedText style={styles.statLabel}>km</ThemedText>
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
              </LinearGradient>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  achievementBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 14,
  },
  startActivityCard: {
    borderRadius: 20,
    marginBottom: 16,
    height: 180,
    overflow: 'visible',
  },
  startActivityContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  startActivityIcon: {
    fontSize: 46,
    marginBottom: 16,
    color: 'white',
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 52,
  },
  startActivityText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 5,
  },
  progressText: {
    color: 'white',
    fontSize: 16,
  },
  stepsContainer: {
    alignItems: 'center',
  },
  stepsCount: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  stepsLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  recentActivities: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  activityCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  activityDate: {
    color: 'white',
    fontSize: 16,
  },
  activityDuration: {
    color: 'white',
    fontSize: 16,
  },
  emptyStateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
});
