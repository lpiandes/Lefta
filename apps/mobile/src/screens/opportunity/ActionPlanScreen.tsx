import { useEffect, useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ActionStep } from '@find-money/shared';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { Timeline } from '../../components/Timeline';
import type { RootStackParamList } from '../../navigation/types';
import { useAppState } from '../../state/AppState';
import { colors, space, type } from '../../theme';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ActionPlan'>;

export function ActionPlanScreen({ navigation, route }: Props) {
  const { getOpportunity, getAction, planAction } = useAppState();
  const opportunity = getOpportunity(route.params.id);
  const action = getAction(route.params.id);
  const selfServe = route.params.selfServe;

  useEffect(() => {
    if (!action) {
      planAction(route.params.id);
    }
  }, [action, planAction, route.params.id]);

  const steps: ActionStep[] = useMemo(() => {
    if (action?.steps) return action.steps;
    return [
      { id: '1', label: 'Verify transaction', status: 'complete' },
      { id: '2', label: 'Prepare request', status: 'complete' },
      { id: '3', label: 'User approval', status: 'current' },
      { id: '4', label: 'Submit / request action', status: 'pending' },
      { id: '5', label: 'Track response', status: 'pending' },
    ];
  }, [action]);

  if (!opportunity) {
    return (
      <Screen>
        <Text style={styles.title}>Opportunity not found</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.title}>Action plan</Text>
      <Text style={styles.support}>
        {selfServe
          ? 'We’ll prepare clear steps so you can handle this yourself.'
          : 'We’ll prepare a dispute/refund request using the information you’ve provided. Automated execution only happens where legally and technically appropriate — you always approve first.'}
      </Text>

      <Text style={styles.meta}>
        {opportunity.merchantName} · {formatMoney(opportunity.potentialValue)}
      </Text>

      <Timeline steps={steps} />

      <Button
        label={selfServe ? 'View guidance' : 'Continue to approval'}
        onPress={() =>
          selfServe
            ? navigation.navigate('Tracking', { id: opportunity.id })
            : navigation.navigate('Approval', { id: opportunity.id })
        }
        style={{ marginTop: space.xl }}
      />
      <Button label="Back" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: space.sm }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.title,
    color: colors.text,
    marginBottom: space.md,
  },
  support: {
    ...type.body,
    color: colors.textMuted,
    marginBottom: space.lg,
  },
  meta: {
    ...type.body,
    color: colors.moneyBright,
    marginBottom: space.md,
  },
});
