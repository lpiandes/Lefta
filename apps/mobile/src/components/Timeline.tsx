import { StyleSheet, Text, View } from 'react-native';
import type { ActionStep } from '@find-money/shared';
import { colors, fonts, space } from '../theme';

type Props = {
  steps: ActionStep[];
};

export function Timeline({ steps }: Props) {
  return (
    <View style={styles.wrap}>
      {steps.map((step, index) => {
        const done = step.status === 'complete';
        const current = step.status === 'current';
        return (
          <View key={step.id} style={styles.row}>
            <View style={styles.railCol}>
              <View
                style={[
                  styles.dot,
                  done && styles.dotDone,
                  current && styles.dotCurrent,
                ]}
              />
              {index < steps.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.content}>
              <Text style={[styles.label, (done || current) && styles.labelActive]}>
                {done ? '✓ ' : current ? '● ' : '○ '}
                {step.label}
              </Text>
              {step.description ? (
                <Text style={styles.description}>{step.description}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: space.sm,
  },
  row: {
    flexDirection: 'row',
    minHeight: 44,
  },
  railCol: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.inkSoft,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  dotDone: {
    backgroundColor: colors.money,
    borderColor: colors.money,
  },
  dotCurrent: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  content: {
    flex: 1,
    paddingBottom: space.md,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.text,
    fontFamily: fonts.bodyMedium,
  },
  description: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
});
