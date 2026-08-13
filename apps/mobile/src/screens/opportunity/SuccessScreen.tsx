import { Share, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import type { RootStackParamList } from '../../navigation/types';
import { useAppState } from '../../state/AppState';
import { colors, fonts, space, type } from '../../theme';
import { formatMoney, userKeepsAfterFee } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Success'>;

export function SuccessScreen({ navigation, route }: Props) {
  const { getOpportunity, getAction, summary } = useAppState();
  const opportunity = getOpportunity(route.params.id);
  const action = getAction(route.params.id);

  if (!opportunity || !action?.recoveredAmount) {
    return (
      <Screen>
        <Text style={styles.title}>Recovery not found</Text>
      </Screen>
    );
  }

  const recovered = action.recoveredAmount;
  const fee = action.feeAmount ?? 0;
  const kept = userKeepsAfterFee(recovered);
  const remaining = Math.max(0, summary.totalFound - summary.recovered);

  return (
    <Screen contentStyle={styles.content}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>{formatMoney(recovered)} recovered</Text>
      <Text style={styles.support}>
        {opportunity.merchantName} refunded your charge.
      </Text>

      <View style={styles.stats}>
        <Text style={styles.stat}>You kept: {formatMoney(kept)}</Text>
        <Text style={styles.stat}>Find Money fee: {formatMoney(fee)}</Text>
      </View>

      <Text style={styles.loop}>Another {formatMoney(remaining)} is waiting.</Text>

      <Button
        label="Share how much you found"
        onPress={() =>
          Share.share({
            message: `💰 Find Money found me ${formatMoney(recovered)}. How much is it finding you?`,
          })
        }
      />
      <Button
        label="Find more"
        variant="secondary"
        onPress={() => navigation.popToTop()}
        style={{ marginTop: space.sm }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: space.xxl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: space.md,
  },
  title: {
    ...type.hero,
    color: colors.text,
    marginBottom: space.md,
  },
  support: {
    ...type.body,
    color: colors.textMuted,
    marginBottom: space.xl,
  },
  stats: {
    gap: 8,
    marginBottom: space.xl,
  },
  stat: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.text,
  },
  loop: {
    fontFamily: fonts.displayMedium,
    fontSize: 24,
    color: colors.moneyBright,
    marginBottom: space.xl,
  },
});
