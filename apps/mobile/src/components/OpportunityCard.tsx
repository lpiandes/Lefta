import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Opportunity } from '@find-money/shared';
import { OPPORTUNITY_CATEGORIES } from '@find-money/shared';
import { colors, fonts, radii, space } from '../theme';
import { formatMoney } from '../utils/format';

type Props = {
  opportunity: Opportunity;
  onPress: () => void;
  ctaLabel?: string;
};

export function OpportunityCard({ opportunity, onPress, ctaLabel }: Props) {
  const meta = OPPORTUNITY_CATEGORIES[opportunity.category];
  const action =
    ctaLabel ??
    (opportunity.category === 'investigate'
      ? 'Investigate'
      : opportunity.category === 'claim' || opportunity.category === 'prevent'
        ? 'Claim'
        : opportunity.category === 'recover'
          ? 'Check'
          : 'Review');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <View style={[styles.rail, { backgroundColor: meta.color }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.amount}>{formatMoney(opportunity.potentialValue)}</Text>
          <Text style={[styles.badge, { color: meta.color }]}>{meta.label}</Text>
        </View>
        <Text style={styles.title}>{opportunity.title}</Text>
        <Text style={styles.summary} numberOfLines={2}>
          {opportunity.summary}
        </Text>
        <Text style={styles.cta}>{action} →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.inkElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: space.md,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  rail: {
    width: 5,
  },
  body: {
    flex: 1,
    padding: space.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  amount: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
  },
  badge: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  summary: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginBottom: 10,
  },
  cta: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.moneyBright,
  },
});
