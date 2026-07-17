import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AppDataProvider } from '@/context/AppDataContext';
import { configureNotifications, registerNotificationResponseHandler } from '@/notifications/notifications';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    configureNotifications();
    const subscription = registerNotificationResponseHandler();
    SplashScreen.hideAsync();
    return () => subscription.remove();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppDataProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="vehicle/new" options={{ title: 'Add Vehicle', presentation: 'modal' }} />
          <Stack.Screen name="vehicle/[id]/index" options={{ title: 'Vehicle' }} />
          <Stack.Screen name="vehicle/[id]/edit" options={{ title: 'Edit Vehicle', presentation: 'modal' }} />
          <Stack.Screen name="vehicle/[id]/history" options={{ title: 'Service History' }} />
          <Stack.Screen name="vehicle/[id]/odometer" options={{ title: 'Update Odometer', presentation: 'modal' }} />
          <Stack.Screen name="vehicle/[id]/log/new" options={{ title: 'Log Oil Change', presentation: 'modal' }} />
          <Stack.Screen name="vehicle/[id]/log/[logId]" options={{ title: 'Edit Oil Change', presentation: 'modal' }} />
        </Stack>
      </AppDataProvider>
    </ThemeProvider>
  );
}
