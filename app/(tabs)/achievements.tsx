import React from 'react';
import { View, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { useBadges, AVAILABLE_BADGES } from '@/hooks/useBadges';
import { router } from 'expo-router';

export default function AchievementsScreen() {
  const { unlockedBadges } = useBadges();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBadgePress = (badge: any) => {
    if (badge.activityId) {
      router.push({
        pathname: '/activity-details',
        params: { id: badge.activityId }
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#6B5ECD', '#8B7FE8']} style={styles.header}>
        <ThemedText style={styles.headerTitle}>Achievements</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {unlockedBadges.length} / {AVAILABLE_BADGES.length} badges unlocked
        </ThemedText>
      </LinearGradient>

      <View style={styles.badgesGrid}>
        {AVAILABLE_BADGES.map((badge) => {
          const unlockedBadge = unlockedBadges.find(b => b.id === badge.id);
          const isUnlocked = !!unlockedBadge;

          return (
            <Pressable
              key={badge.id}
              style={[styles.badgeCard, !isUnlocked && styles.badgeCardLocked]}
              onPress={() => isUnlocked && handleBadgePress(unlockedBadge)}
              disabled={!isUnlocked}
            >
              <LinearGradient
                colors={isUnlocked ? ['#2D7CFF', '#5E9FFF'] : ['#3A3A3A', '#4A4A4A']}
                style={styles.badgeContent}
              >
                <ThemedText style={styles.badgeIcon}>{badge.icon}</ThemedText>
                <ThemedText style={styles.badgeName}>{badge.name}</ThemedText>
                <ThemedText style={styles.badgeDescription}>{badge.description}</ThemedText>
                {isUnlocked && (
                  <View style={styles.unlockedInfo}>
                    <View style={styles.dateContainer}>
                      <ThemedText style={styles.dateIcon}>🏆</ThemedText>
                      <ThemedText style={styles.unlockedDate}>
                        {formatDate(unlockedBadge.unlockedAt || '')}
                      </ThemedText>
                    </View>
                    <View style={styles.tapContainer}>
                      <ThemedText style={styles.tapIcon}>👆</ThemedText>
                      <ThemedText style={styles.tapInfo}>View activity details</ThemedText>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  badgesGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badgeCard: {
    width: '45%',
    minHeight: 220,
    borderRadius: 20,
    overflow: 'hidden',
    margin: '2%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 40,
    height: 50,
    lineHeight: 50,
    textAlignVertical: 'center',
    includeFontPadding: false,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  badgeName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
  },
  unlockedInfo: {
    marginTop: 'auto',
    width: '100%',
    paddingHorizontal: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  dateIcon: {
    fontSize: 12,
    color: '#FFD700',
    marginRight: 4,
  },
  unlockedDate: {
    fontSize: 11,
    color: 'white',
    fontWeight: '500',
  },
  tapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D7CFF',
    padding: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    justifyContent: 'center',
  },
  tapInfo: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },
  tapIcon: {
    fontSize: 12,
    color: 'white',
    marginRight: 4,
  },
});
