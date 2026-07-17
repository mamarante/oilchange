import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'destructive' | 'secondary';
  disabled?: boolean;
}

const VARIANT_BACKGROUND: Record<NonNullable<PrimaryButtonProps['variant']>, string> = {
  primary: '#208AEF',
  destructive: '#B42318',
  secondary: 'transparent',
};

export function PrimaryButton({ label, onPress, variant = 'primary', disabled }: PrimaryButtonProps) {
  const background = VARIANT_BACKGROUND[variant];

  return (
    <Pressable onPress={onPress} disabled={disabled} style={{ opacity: disabled ? 0.5 : 1 }}>
      <ThemedText
        type="smallBold"
        style={[
          styles.button,
          { backgroundColor: background, color: variant === 'secondary' ? '#208AEF' : '#FFFFFF' },
          variant === 'secondary' && styles.secondaryBorder,
        ]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    textAlign: 'center',
    overflow: 'hidden',
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: '#208AEF',
  },
});
