import { StyleSheet, Text } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FilterChips } from '../../components/FilterChips';
import { MoneyFoundHeader } from '../../components/MoneyFoundHeader';
import { OpportunityCard } from '../../components/OpportunityCard';
import { Screen } from '../../components/Screen';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { useAppState } from '../../state/AppState';
import { colors, fonts, space } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Found'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function FoundScreen({ navigation }: Props) {
  const { summary, activeOpportunities, filter, setFilter } = useAppState();
  const foundNow = Math.max(0, summary.totalFound - summary.recovered);

  return (
    <Screen>
      <Text style={styles.title}>Found</Text>
      <MoneyFoundHeader amount={foundNow} count={summary.opportunityCount} />
      <FilterChips value={filter} onChange={setFilter} />

      {activeOpportunities.map((opp) => (
        <OpportunityCard
          key={opp.id}
          opportunity={opp}
          onPress={() => navigation.navigate('OpportunityDetail', { id: opp.id })}
          ctaLabel={`${opp.confidence} confidence · ${opp.effort} effort`}
        />
      ))}

      {activeOpportunities.length === 0 ? (
        <Text style={styles.empty}>No opportunities in this filter.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.text,
    marginBottom: space.sm,
  },
  empty: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginTop: space.md,
  },
});
