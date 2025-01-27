import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >

      <Stack.Screen name="activity-details" options={{ headerShown: true }} />
    </Stack>
  );
}
