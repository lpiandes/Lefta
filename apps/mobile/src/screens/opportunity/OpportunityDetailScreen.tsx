import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OPPORTUNITY_CATEGORIES } from '@find-money/shared';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import type { RootStackParamList } from '../../navigation/types';
import { useAppState } from '../../state/AppState';
import { colors, fonts, radii, space, type } from '../../theme';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'OpportunityDetail'>;

export function OpportunityDetailScreen({ navigation, route }: Props) {
  const { getOpportunity, planAction, ignoreOpportunity } = useAppState();
  const opportunity = getOpportunity(route.params.id);

  if (!opportunity) {
    return (
      <Screen>
        <Text style={styles.title}>Opportunity not found</Text>
        <Button label="Back" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  const meta = OPPORTUNITY_CATEGORIES[opportunity.category];

  return (
    <Screen>
      <Text style={[styles.badge, { color: meta.color }]}>{meta.label}</Text>
      <Text style={styles.title}>{opportunity.title}</Text>
      <Text style={styles.amount}>Potential recovery: {formatMoney(opportunity.potentialValue)}</Text>
      <Text style={styles.summary}>{opportunity.summary}</Text>

      <Text style={styles.section}>What we found</Text>
      <View style={styles.panel}>
        {opportunity.evidence.map((e) => (
          <View key={`${e.label}-${e.value}`} style={styles.evidenceRow}>
            <Text style={styles.evidenceLabel}>{e.label}</Text>
            <Text style={styles.evidenceValue}>{e.value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Why we’re flagging it</Text>
      <Text style={styles.body}>{opportunity.whyFlagged}</Text>

      <Text style={styles.section}>Confidence</Text>
      <Text style={styles.body}>{opportunity.confidence}</Text>

      <Text style={styles.section}>What do you want to do?</Text>
      <Button
        label="Do it for me"
        onPress={() => {
          planAction(opportunity.id);
          navigation.navigate('ActionPlan', { id: opportunity.id });
        }}
      />
      <Button
        label="I’ll handle it myself"
        variant="secondary"
        onPress={() => navigation.navigate('ActionPlan', { id: opportunity.id, selfServe: true })}
        style={{ marginTop: space.sm }}
      />
      <Button
        label="Ignore"
        variant="ghost"
        onPress={() => {
          ignoreOpportunity(opportunity.id);
          navigation.goBack();
        }}
        style={{ marginTop: space.sm }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: space.sm,
  },
  title: {
    ...type.title,
    color: colors.text,
    marginBottom: space.sm,
  },
  amount: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.moneyBright,
    marginBottom: space.md,
  },
  summary: {
    ...type.body,
    color: colors.textMuted,
    marginBottom: space.lg,
  },
  section: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
    marginTop: space.md,
    marginBottom: space.sm,
  },
  body: {
    ...type.body,
    color: colors.textMuted,
  },
  panel: {
    backgroundColor: colors.inkElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
  },
  evidenceRow: {
    marginBottom: 10,
  },
  evidenceLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  evidenceValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
    marginTop: 2,
  },
});
