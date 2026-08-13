import { StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { MoneyFoundHeader } from '../../components/MoneyFoundHeader';
import { OpportunityCard } from '../../components/OpportunityCard';
import { Screen } from '../../components/Screen';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { useAppState } from '../../state/AppState';
import { colors, fonts, space } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const { summary, activeOpportunities } = useAppState();
  const foundNow = Math.max(0, summary.totalFound - summary.recovered);

  return (
    <Screen>
      <Text style={styles.brand}>Find Money</Text>
      <MoneyFoundHeader amount={foundNow} count={summary.opportunityCount} />

      <Text style={styles.section}>Your money opportunities</Text>

      {activeOpportunities.map((opp) => (
        <OpportunityCard
          key={opp.id}
          opportunity={opp}
          onPress={() => navigation.navigate('OpportunityDetail', { id: opp.id })}
        />
      ))}

      {activeOpportunities.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>You’re caught up</Text>
          <Text style={styles.emptyBody}>We’ll keep scanning for new opportunities.</Text>
        </View>
      ) : (
        <Button
          label="Recover Everything"
          onPress={() => navigation.navigate('Found')}
          style={{ marginTop: space.sm }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.moneyBright,
    marginBottom: space.md,
  },
  section: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: space.md,
  },
  empty: {
    marginTop: space.xl,
  },
  emptyTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.text,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 6,
  },
});
