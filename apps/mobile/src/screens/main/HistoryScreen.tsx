import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { useAppState } from '../../state/AppState';
import { colors, fonts, radii, space, type } from '../../theme';
import { formatMoney } from '../../utils/format';

export function HistoryScreen() {
  const { summary, opportunities, actions } = useAppState();
  const recovered = opportunities.filter((o) => o.status === 'recovered');
  const pending = opportunities.filter((o) =>
    ['submitted', 'waiting', 'awaiting_approval', 'action_planned'].includes(o.status),
  );

  return (
    <Screen>
      <Text style={styles.title}>Your Money</Text>

      <View style={styles.grid}>
        <Stat label="Total found" value={formatMoney(summary.totalFound)} />
        <Stat label="Recovered" value={formatMoney(summary.recovered)} highlight />
        <Stat label="Pending" value={formatMoney(summary.pending)} />
        <Stat label="Ignored" value={formatMoney(summary.ignored)} />
      </View>

      <Text style={styles.section}>Recovered</Text>
      {recovered.length === 0 ? (
        <Text style={styles.empty}>Nothing recovered yet — approve an opportunity to start.</Text>
      ) : (
        recovered.map((o) => {
          const action = actions.find((a) => a.opportunityId === o.id);
          return (
            <View key={o.id} style={styles.row}>
              <View>
                <Text style={styles.rowTitle}>{o.merchantName}</Text>
                <Text style={styles.rowSub}>{o.title}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.rowAmount}>{formatMoney(o.potentialValue)}</Text>
                {action?.feeAmount != null ? (
                  <Text style={styles.fee}>Fee {formatMoney(action.feeAmount)}</Text>
                ) : null}
              </View>
            </View>
          );
        })
      )}

      <Text style={styles.section}>Pending</Text>
      {pending.length === 0 ? (
        <Text style={styles.empty}>No recoveries in progress.</Text>
      ) : (
        pending.map((o) => (
          <View key={o.id} style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>{o.merchantName}</Text>
              <Text style={styles.rowSub}>{o.status.replace('_', ' ')}</Text>
            </View>
            <Text style={styles.rowAmount}>{formatMoney(o.potentialValue)}</Text>
          </View>
        ))
      )}
    </Screen>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.stat, highlight && styles.statHighlight]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.title,
    color: colors.text,
    marginBottom: space.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginBottom: space.xl,
  },
  stat: {
    width: '48%',
    backgroundColor: colors.inkElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
  },
  statHighlight: {
    borderColor: colors.money,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
  },
  section: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: space.sm,
    marginTop: space.md,
  },
  empty: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginBottom: space.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  rowSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowAmount: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.moneyBright,
  },
  right: {
    alignItems: 'flex-end',
  },
  fee: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
