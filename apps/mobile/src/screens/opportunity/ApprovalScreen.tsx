import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { CheckRow } from '../../components/CheckRow';
import { Screen } from '../../components/Screen';
import type { RootStackParamList } from '../../navigation/types';
import { useAppState } from '../../state/AppState';
import { colors, fonts, radii, space, type } from '../../theme';
import { formatMoney } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'Approval'>;

export function ApprovalScreen({ navigation, route }: Props) {
  const { getOpportunity, getAction, approveAction } = useAppState();
  const opportunity = getOpportunity(route.params.id);
  const action = getAction(route.params.id);

  if (!opportunity) {
    return (
      <Screen showBack>
        <Text style={styles.title}>Opportunity not found</Text>
      </Screen>
    );
  }

  return (
    <Screen showBack>
      <Text style={styles.title}>Ready to take action</Text>

      <View style={styles.panel}>
        <Row label="Merchant" value={opportunity.merchantName} />
        <Row label="Amount" value={formatMoney(opportunity.potentialValue)} />
        <Row label="Action" value="Request refund / investigation" />
      </View>

      <Text style={styles.section}>Information being shared</Text>
      {(action?.sharedInfo ?? []).map((item) => (
        <CheckRow key={item} label={item} />
      ))}

      <Text style={styles.note}>
        Nothing consequential happens without this approval. Outcomes are opportunities until the
        merchant or institution confirms.
      </Text>

      <Button
        label="Approve & Submit"
        onPress={() => {
          void approveAction(opportunity.id).then(() =>
            navigation.replace('Tracking', { id: opportunity.id }),
          );
        }}
      />
      <Button label="Cancel" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: space.sm }} />
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.title,
    color: colors.text,
    marginBottom: space.lg,
  },
  panel: {
    backgroundColor: colors.inkElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
    marginBottom: space.lg,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  value: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.text,
    marginTop: 2,
  },
  section: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
    marginBottom: space.sm,
  },
  note: {
    ...type.body,
    color: colors.goldSoft,
    marginVertical: space.lg,
  },
});
