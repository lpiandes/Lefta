import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, space, type } from '../theme';
import { formatMoney } from '../utils/format';

type Props = {
  amount: number;
  count: number;
};

export function MoneyFoundHeader({ amount, count }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>We found</Text>
      <Text style={styles.amount}>{formatMoney(amount)}</Text>
      <Text style={styles.sub}>
        {count} {count === 1 ? 'opportunity' : 'opportunities'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: space.lg,
  },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.moneyBright,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  amount: {
    ...type.money,
    color: colors.text,
  },
  sub: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
  },
});
