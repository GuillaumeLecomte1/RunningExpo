import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6B5ECD',
        tabBarInactiveTintColor: '#A8A8A8',
        headerShown: false,
        tabBarBackground: () => (
          <View style={styles.tabBarContainer}>
            <BlurView intensity={80} tint="light" style={styles.blur}>
              <View style={styles.tabBarBackground} />
            </BlurView>
          </View>
        ),
        tabBarStyle: {
          position: 'absolute',
          bottom: 34,
          left: 20,
          right: 20,
          height: 60,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          borderRadius: 15,
          marginHorizontal: 20,
        },
        tabBarItemStyle: {
          paddingTop: 12,
          paddingBottom: 12,
        },
        tabBarLabelStyle: {
          display: 'none',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="list.bullet.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="trophy.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="envelope.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <IconSymbol size={22} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 15,
  },
  blur: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  tabBarBackground: {
    flex: 1,
  },
});
