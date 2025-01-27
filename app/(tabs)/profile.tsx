import { View, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

const menuItems = [
  { icon: '🎯', title: 'Personal parameters', route: '/(tabs)/parameters' },
  { icon: '🏆', title: 'Achievements', route: '/(tabs)/achievements' },
  { icon: '⚙️', title: 'Settings', route: '/(tabs)/settings' },
  { icon: '📞', title: 'Our contact', route: '/(tabs)/contact' },
];

export default function ProfileScreen() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <LinearGradient
      colors={['#6B5ECD', '#8B7FE8']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Profile</ThemedText>
          <Pressable 
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.buttonPressed
            ]}
          >
            <ThemedText style={styles.editIcon}>✏️</ThemedText>
          </Pressable>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <ThemedText style={styles.name}>Andrew</ThemedText>
          <ThemedText style={styles.level}>Beginner</ThemedText>
        </View>

        {/* Total Progress Card */}
        <Pressable 
          style={({ pressed }) => [
            styles.progressCard,
            pressed && styles.cardPressed
          ]}
        >
          <View style={styles.progressHeader}>
            <ThemedText style={styles.progressTitle}>Total progress</ThemedText>
            <ThemedText style={styles.chevron}>›</ThemedText>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>103,2</ThemedText>
              <ThemedText style={styles.statLabel}>km</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>16,9</ThemedText>
              <ThemedText style={styles.statLabel}>hr</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>1,5k</ThemedText>
              <ThemedText style={styles.statLabel}>kcal</ThemedText>
            </View>
          </View>
        </Pressable>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.menuItem,
                index !== menuItems.length - 1 && styles.menuItemBorder,
                pressed && styles.menuItemPressed,
              ]}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.menuItemContent}>
                <View style={styles.menuIconContainer}>
                  <ThemedText style={styles.menuIcon}>{item.icon}</ThemedText>
                </View>
                <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
              </View>
              <ThemedText style={styles.menuChevron}>›</ThemedText>
            </Pressable>
          ))}

          {/* Theme Switch */}
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuItemContent}>
              <View style={styles.menuIconContainer}>
                <ThemedText style={styles.menuIcon}>{isDarkMode ? '🌙' : '☀️'}</ThemedText>
              </View>
              <ThemedText style={styles.menuTitle}>Dark Mode</ThemedText>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#2D7CFF' }}
              thumbColor={isDarkMode ? '#FFFFFF' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>

        {/* Espace pour la barre de navigation */}
        <View style={{ height: 104 }}>
          <ThemedText style={{ display: 'none' }}>
            50 (hauteur de la barre) + 34 (marge du bas) + 20 (espace supplémentaire)
          </ThemedText>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
  },
  editIcon: {
    fontSize: 20,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  name: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  level: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 18,
    color: '#000',
  },
  chevron: {
    fontSize: 24,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTitle: {
    fontSize: 16,
    color: '#000',
  },
  menuChevron: {
    fontSize: 16,
    color: '#666',
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  menuItemPressed: {
    backgroundColor: '#f8f8f8',
  },
});
