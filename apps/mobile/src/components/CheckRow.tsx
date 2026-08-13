import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, space } from '../theme';

type Props = {
  label: string;
  positive?: boolean;
};

export function CheckRow({ label, positive = true }: Props) {
  return (
    <View style={styles.row}>
      <Text style={[styles.mark, !positive && styles.bad]}>{positive ? '✓' : '❌'}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  mark: {
    width: 28,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.moneyBright,
  },
  bad: {
    color: colors.danger,
  },
  label: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
  },
});
