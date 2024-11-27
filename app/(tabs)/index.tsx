import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useActivities } from '@/hooks/useActivities';

export default function HomeScreen() {
  const { activities } = useActivities();
  const recentActivities = activities.slice(0, 3);

  const handleWeekGoalPress = () => {
    // Navigation vers la page de détails des objectifs
    router.push('/goals');
  };

  const handleActivityPress = (activity: any) => {
    router.push({
      pathname: '/activity-details',
      params: { 
        id: activity.id,
        date: activity.date,
        distance: activity.distance,
        calories: activity.calories,
        speed: activity.speed,
        duration: activity.duration
      }
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6B5ECD', '#8B7FE8']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={styles.greeting}>Hello, <ThemedText style={styles.name}>Andrew</ThemedText></ThemedText>
              <ThemedText style={styles.level}>Beginner</ThemedText>
            </View>
            <Pressable 
              style={({ pressed }) => [
                styles.settingsButton,
                pressed && styles.buttonPressed
              ]}
              onPress={() => router.push('/settings')}
            >
              <ThemedText style={styles.settingsIcon}>⚙️</ThemedText>
            </Pressable>
          </View>

          {/* Week Goal Card */}
          <Pressable 
            style={({ pressed }) => [
              styles.weekGoalCard,
              pressed && styles.cardPressed
            ]}
            onPress={handleWeekGoalPress}
          >
            <View>
              <View style={styles.weekGoalHeader}>
                <ThemedText style={styles.weekGoalTitle}>Week goal</ThemedText>
                <ThemedText style={styles.weekGoalValue}>50 km</ThemedText>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '70%' }]} />
                </View>
                <View style={styles.progressLabels}>
                  <ThemedText style={styles.progressText}>35 km done</ThemedText>
                  <ThemedText style={styles.progressText}>15 km left</ThemedText>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Current Jogging Card */}
          <Pressable 
            style={({ pressed }) => [
              styles.currentJoggingCard,
              pressed && styles.cardPressed
            ]}
            onPress={() => router.push('/current-activity')}
          >
            <View style={styles.joggingInfo}>
              <View style={styles.timeContainer}>
                <View style={styles.jogIcon} />
                <ThemedText style={styles.timeText}>01:09:44</ThemedText>
              </View>
              <View style={styles.distanceContainer}>
                <ThemedText style={styles.distanceValue}>10.9 km</ThemedText>
                <ThemedText style={styles.caloriesText}>539 kcal</ThemedText>
              </View>
            </View>
          </Pressable>

          {/* Recent Activity Section */}
          <View style={styles.recentActivitySection}>
            <View style={styles.recentActivityHeader}>
              <ThemedText style={styles.recentActivityTitle}>Recent activity</ThemedText>
              <Pressable
                style={({ pressed }) => pressed && styles.buttonPressed}
                onPress={() => router.push('/all-activities')}
              >
                <ThemedText style={styles.allButton}>All</ThemedText>
              </Pressable>
            </View>

            {/* Activity List */}
            <View style={styles.activityList}>
              {recentActivities.map((activity, index) => (
                <Pressable 
                  key={activity.id}
                  style={({ pressed }) => [
                    styles.activityItem,
                    pressed && styles.activityItemPressed,
                    index === recentActivities.length - 1 && styles.lastActivityItem
                  ]}
                  onPress={() => handleActivityPress(activity)}
                >
                  <View>
                    <ThemedText style={styles.activityDate}>{activity.date}</ThemedText>
                    <ThemedText style={styles.activityDistance}>{activity.distance} km</ThemedText>
                    <ThemedText style={styles.activityStats}>
                      {activity.calories} kcal   {activity.speed} km/hr
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
          
          {/* Bottom Padding for ScrollView */}
          <View style={styles.bottomPadding} />
          
          {/* Espace pour la barre de navigation */}
          <View style={{ height: 104 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 40,
  },
  greeting: {
    fontSize: 24,
    color: 'white',
  },
  name: {
    fontWeight: 'bold',
    color: 'white',
  },
  level: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  weekGoalCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  weekGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekGoalTitle: {
    fontSize: 18,
    color: '#000',
  },
  weekGoalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B5ECD',
  },
  progressContainer: {
    marginTop: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B5ECD',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  currentJoggingCard: {
    backgroundColor: '#7B6FDD',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  joggingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jogIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    marginRight: 10,
  },
  timeText: {
    color: 'white',
    fontSize: 16,
  },
  distanceContainer: {
    alignItems: 'flex-end',
  },
  distanceValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  caloriesText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  recentActivitySection: {
    marginTop: 20,
  },
  recentActivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recentActivityTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  allButton: {
    color: 'white',
    fontSize: 16,
  },
  activityList: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
  },
  activityItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityDate: {
    color: '#666',
    fontSize: 14,
  },
  activityDistance: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  activityStats: {
    color: '#666',
    fontSize: 14,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  activityItemPressed: {
    backgroundColor: '#f8f8f8',
  },
  lastActivityItem: {
    borderBottomWidth: 0,
  },
  bottomPadding: {
    height: 20,
  },
});
