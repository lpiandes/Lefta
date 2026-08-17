import { Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts } from '../theme';

type Props = {
  label?: string;
};

export function BackHeader({ label = 'Back' }: Props) {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();

  if (!canGoBack) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={8}
      onPress={() => navigation.goBack()}
      style={({ pressed }) => [styles.hit, pressed && styles.pressed]}
    >
      <Text style={styles.chevron}>‹</Text>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: -8,
    paddingRight: 12,
    marginBottom: 8,
  },
  pressed: {
    opacity: 0.6,
  },
  chevron: {
    fontFamily: fonts.body,
    fontSize: 32,
    lineHeight: 36,
    color: colors.moneyBright,
    marginTop: -2,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.moneyBright,
    marginLeft: 2,
  },
});
