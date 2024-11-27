import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useActivities } from '@/hooks/useActivities';

export default function AllActivitiesScreen() {
  const activities = useActivities((state) => state.activities);

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
    <LinearGradient
      colors={['#6B5ECD', '#8B7FE8']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>All Activities</ThemedText>
        </View>

        <View style={styles.activityList}>
          {activities.map((activity) => (
            <Pressable
              key={activity.id}
              style={({ pressed }) => [
                styles.activityItem,
                pressed && styles.activityItemPressed
              ]}
              onPress={() => handleActivityPress(activity)}
            >
              <View>
                <ThemedText style={styles.activityDate}>{activity.date}</ThemedText>
                <ThemedText style={styles.activityDistance}>{activity.distance} km</ThemedText>
                <ThemedText style={styles.activityStats}>
                  {activity.calories} kcal • {activity.speed} km/hr
                </ThemedText>
                <ThemedText style={styles.activityDuration}>{activity.duration}</ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
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
  activityItemPressed: {
    backgroundColor: '#f8f8f8',
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
  activityDuration: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
}); 