import { useCallback, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useFocusEffect } from 'expo-router';
import { StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { requestNotificationPermissions } from '@/notifications/notifications';

export default function SettingsScreen() {
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  useFocusEffect(
    useCallback(() => {
      Notifications.getPermissionsAsync().then((status) => setPermissionGranted(status.granted));
    }, []),
  );

  async function handleEnableNotifications() {
    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);
  }

  return (
    <ScreenScrollView>
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Notifications
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Reminders fire as local notifications on this device — no account or server required. Each vehicle&apos;s reminder lead time
          (set on its profile) controls how early you get notified before the mileage or date due point.
        </ThemedText>
        {permissionGranted === false && (
          <>
            <ThemedText themeColor="textSecondary">Notifications are currently disabled for this app.</ThemedText>
            <PrimaryButton label="Enable Notifications" onPress={handleEnableNotifications} />
          </>
        )}
        {permissionGranted === true && <ThemedText themeColor="textSecondary">Notifications are enabled.</ThemedText>}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          SMS Reminders
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          SMS reminders (e.g. via Twilio) are not included in this version. Sending SMS requires a backend server to hold API
          credentials securely — this app is intentionally local-only with no server, so SMS is left as a Phase 2 extension once a
          backend is introduced.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          About
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Oil Change tracks service history and reminders per vehicle, stored only on this device.
        </ThemedText>
      </ThemedView>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 20,
  },
});
