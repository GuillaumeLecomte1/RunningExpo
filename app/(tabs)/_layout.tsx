import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useCurrentActivity } from '@/hooks/useCurrentActivity';

export default function TabLayout() {
  const { isActive } = useCurrentActivity();

  const renderIcon = (emoji: string) => {
    return (
      <Text style={{ fontSize: 24, textAlign: 'center' }}>{emoji}</Text>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => renderIcon('🏠'),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Achievements',
          headerShown: true,
          tabBarIcon: () => renderIcon('🏆'),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: () => renderIcon('✉️'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => renderIcon('👤'),
        }}
      />
    </Tabs>
  );
}
