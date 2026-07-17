import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput } from 'react-native';
import RNDateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDateDisplay, parseISODate, toISODate } from '@/utils/date';

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
}

export function DateField({ label, value, onChange }: DateFieldProps) {
  const theme = useTheme();
  const [showIOSPicker, setShowIOSPicker] = useState(false);
  const dateValue = parseISODate(value);

  if (Platform.OS === 'web') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="smallBold">{label}</ThemedText>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
        />
      </ThemedView>
    );
  }

  function handlePress() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: dateValue,
        mode: 'date',
        onChange: (_event, selectedDate) => {
          if (selectedDate) onChange(toISODate(selectedDate));
        },
      });
    } else {
      setShowIOSPicker(true);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <Pressable onPress={handlePress}>
        <ThemedView type="backgroundElement" style={styles.input}>
          <ThemedText>{formatDateDisplay(value)}</ThemedText>
        </ThemedView>
      </Pressable>
      {showIOSPicker && (
        <ThemedView type="backgroundElement" style={styles.iosPickerWrap}>
          <RNDateTimePicker
            value={dateValue}
            mode="date"
            display="inline"
            onValueChange={(_event, selectedDate) => {
              if (selectedDate) onChange(toISODate(selectedDate));
            }}
          />
          <Pressable onPress={() => setShowIOSPicker(false)} style={styles.doneButton}>
            <ThemedText type="linkPrimary">Done</ThemedText>
          </Pressable>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  iosPickerWrap: {
    borderRadius: Spacing.two,
    padding: Spacing.two,
    alignItems: 'flex-end',
  },
  doneButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
});
