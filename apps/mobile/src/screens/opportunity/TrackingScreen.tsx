import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { Timeline } from '../../components/Timeline';
import type { RootStackParamList } from '../../navigation/types';
import { useAppState } from '../../state/AppState';
import { colors, fonts, space, type } from '../../theme';
import { formatCompactDate, formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Tracking'>;

export function TrackingScreen({ navigation, route }: Props) {
  const { getOpportunity, getAction, completeRecovery } = useAppState();
  const opportunity = getOpportunity(route.params.id);
  const action = getAction(route.params.id);

  if (!opportunity) {
    return (
      <Screen>
        <Text style={styles.title}>Opportunity not found</Text>
      </Screen>
    );
  }

  const trackingSteps = [
    { id: '1', label: 'Opportunity identified', status: 'complete' as const },
    {
      id: '2',
      label: 'User approved',
      status: action?.submittedAt ? ('complete' as const) : ('current' as const),
    },
    {
      id: '3',
      label: 'Request submitted',
      status: action?.submittedAt ? ('complete' as const) : ('pending' as const),
    },
    {
      id: '4',
      label: 'Waiting for merchant',
      status:
        action?.status === 'waiting'
          ? ('current' as const)
          : action?.status === 'recovered'
            ? ('complete' as const)
            : ('pending' as const),
    },
    {
      id: '5',
      label: 'Money recovered',
      status: action?.status === 'recovered' ? ('complete' as const) : ('pending' as const),
    },
  ];

  return (
    <Screen>
      <Text style={styles.eyebrow}>Recovery in progress</Text>
      <Text style={styles.title}>{opportunity.merchantName}</Text>
      <Text style={styles.amount}>{formatMoney(opportunity.potentialValue)}</Text>
      {action?.submittedAt ? (
        <Text style={styles.meta}>Submitted: {formatCompactDate(action.submittedAt)}</Text>
      ) : null}
      <Text style={styles.status}>
        Status: {action?.status === 'waiting' ? 'Waiting for merchant' : opportunity.status}
      </Text>

      <View style={{ marginTop: space.lg }}>
        <Timeline steps={trackingSteps} />
      </View>

      {action?.status !== 'recovered' ? (
        <Button
          label="Simulate merchant recovery (demo)"
          onPress={() => {
            completeRecovery(opportunity.id);
            navigation.replace('Success', { id: opportunity.id });
          }}
          style={{ marginTop: space.xl }}
        />
      ) : (
        <Button
          label="View success"
          onPress={() => navigation.replace('Success', { id: opportunity.id })}
          style={{ marginTop: space.xl }}
        />
      )}

      <Button
        label="Back to home"
        variant="ghost"
        onPress={() => navigation.popToTop()}
        style={{ marginTop: space.sm }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: space.sm,
  },
  title: {
    ...type.title,
    color: colors.text,
  },
  amount: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.moneyBright,
    marginTop: space.sm,
  },
  meta: {
    ...type.body,
    color: colors.textMuted,
    marginTop: space.sm,
  },
  status: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
    marginTop: 6,
  },
});
