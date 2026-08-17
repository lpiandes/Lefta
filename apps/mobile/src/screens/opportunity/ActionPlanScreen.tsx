import { useEffect, useMemo } from 'react';
import { Share, StyleSheet, Text } from 'react-native';
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
      void planAction(route.params.id, selfServe);
    }
  }, [action, planAction, route.params.id, selfServe]);

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
      <Screen showBack>
        <Text style={styles.title}>Opportunity not found</Text>
      </Screen>
    );
  }

  return (
    <Screen showBack>
      <Text style={styles.title}>Action plan</Text>
      <Text style={styles.support}>
        {selfServe
          ? 'We’ll prepare clear steps so you can handle this yourself. Find Money will not contact the merchant on this path.'
          : 'We’ll prepare a dispute/refund request using the information you’ve provided. Automated execution only happens where legally and technically appropriate — you always approve first. Recovery is not confirmed until cash posts.'}
      </Text>

      <Text style={styles.meta}>
        {opportunity.merchantName} · {formatMoney(opportunity.potentialValue)}
      </Text>

      <Timeline steps={steps} />

      {(action?.guidance ?? []).map((line) => (
        <Text key={line} style={styles.guide}>
          • {line}
        </Text>
      ))}

      {action?.disputeDraft ? (
        <Button
          label="Share / copy request draft"
          variant="secondary"
          onPress={() => void Share.share({ message: action.disputeDraft! })}
          style={{ marginTop: space.lg }}
        />
      ) : null}

      <Text style={styles.guide}>
        Find Money does not send this to the merchant for you. You review and send it.
      </Text>

      <Button
        label={selfServe ? 'View guidance' : 'Continue to approval'}
        onPress={() =>
          selfServe
            ? navigation.navigate('Tracking', { id: opportunity.id })
            : navigation.navigate('Approval', { id: opportunity.id })
        }
        style={{ marginTop: space.xl }}
      />
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
  guide: {
    ...type.body,
    color: colors.textMuted,
    marginTop: 8,
  },
});
