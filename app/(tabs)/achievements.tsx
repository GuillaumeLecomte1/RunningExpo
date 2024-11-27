import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';

export default function AchievementsScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6B5ECD', '#8B7FE8']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          {/* En-tête */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Mes Réalisations</ThemedText>
            <ThemedText style={styles.statsText}>12 réalisations débloquées</ThemedText>
          </View>

          {/* Section Dernière Course */}
          <View style={styles.lastRunCard}>
            <ThemedText style={styles.cardTitle}>Dernière Course</ThemedText>
            <View style={styles.runStats}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>10.5</ThemedText>
                <ThemedText style={styles.statLabel}>km</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>52:30</ThemedText>
                <ThemedText style={styles.statLabel}>temps</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>5'00"</ThemedText>
                <ThemedText style={styles.statLabel}>min/km</ThemedText>
              </View>
            </View>
          </View>

          {/* Section Badges */}
          <View style={styles.badgesSection}>
            <ThemedText style={styles.sectionTitle}>Badges</ThemedText>
            <View style={styles.badgesGrid}>
              {[...Array(6)].map((_, index) => (
                <Pressable 
                  key={index}
                  style={styles.badgeItem}
                >
                  <View style={styles.badge} />
                  <ThemedText style={styles.badgeTitle}>
                    {index === 0 ? "Premier 5K" : index === 1 ? "Course Matinale" : "???"}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Section Records */}
          <View style={styles.recordsSection}>
            <ThemedText style={styles.sectionTitle}>Records Personnels</ThemedText>
            <View style={styles.recordsList}>
              {[
                { title: "Plus longue distance", value: "15.3 km" },
                { title: "Meilleur temps 5K", value: "25:30" },
                { title: "Plus longue série", value: "7 jours" },
              ].map((record, index) => (
                <View key={index} style={styles.recordItem}>
                  <ThemedText style={styles.recordTitle}>{record.title}</ThemedText>
                  <ThemedText style={styles.recordValue}>{record.value}</ThemedText>
                </View>
              ))}
            </View>
          </View>

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
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statsText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  lastRunCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  runStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B5ECD',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  badgesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  badgeItem: {
    width: '30%',
    alignItems: 'center',
  },
  badge: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
  },
  recordsSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  recordsList: {
    gap: 15,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTitle: {
    fontSize: 16,
    color: '#000',
  },
  recordValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B5ECD',
  },
});
