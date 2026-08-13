import { StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OpportunityCard } from '../../components/OpportunityCard';
import { Screen } from '../../components/Screen';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { useAppState } from '../../state/AppState';
import { colors, fonts, space, type } from '../../theme';
import { daysUntil, formatMoney } from '../../utils/format';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Expiring'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function ExpiringScreen({ navigation }: Props) {
  const { opportunities } = useAppState();
  const expiring = opportunities
    .filter((o) => o.expiresAt && !['recovered', 'ignored'].includes(o.status))
    .sort((a, b) => (a.expiresAt! > b.expiresAt! ? 1 : -1));

  return (
    <Screen>
      <Text style={styles.title}>Don’t lose this money</Text>
      <Text style={styles.support}>Credits, returns, and windows closing soon.</Text>

      {expiring.map((opp) => {
        const days = daysUntil(opp.expiresAt!);
        return (
          <View key={opp.id} style={styles.block}>
            <Text style={styles.countdown}>
              {formatMoney(opp.potentialValue)} · expires in {days} days
            </Text>
            <OpportunityCard
              opportunity={opp}
              onPress={() => navigation.navigate('OpportunityDetail', { id: opp.id })}
              ctaLabel="Use it"
            />
          </View>
        );
      })}

      {expiring.length === 0 ? (
        <Text style={styles.empty}>No expiring money right now.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.title,
    color: colors.text,
    marginBottom: space.sm,
  },
  support: {
    ...type.body,
    color: colors.textMuted,
    marginBottom: space.lg,
  },
  block: {
    marginBottom: space.sm,
  },
  countdown: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.warning,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  empty: {
    fontFamily: fonts.body,
    color: colors.textMuted,
  },
});
