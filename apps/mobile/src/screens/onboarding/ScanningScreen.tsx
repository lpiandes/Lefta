import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { useAppState } from '../../state/AppState';
import { colors, fonts, space, type } from '../../theme';
import { formatMoney } from '../../utils/format';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Scanning'>;

export function ScanningScreen({ navigation }: Props) {
  const { runScan, scanSteps, summary } = useAppState();
  const [done, setDone] = useState(false);
  const [resultCount, setResultCount] = useState(0);
  const [resultValue, setResultValue] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await runScan();
      if (!mounted) return;
      setDone(true);
    })();
    return () => {
      mounted = false;
    };
  }, [runScan]);

  useEffect(() => {
    if (!done) return;
    setResultCount(summary.opportunityCount);
    setResultValue(summary.totalFound - summary.recovered);
    const t = setTimeout(() => navigation.replace('Main'), 1600);
    return () => clearTimeout(t);
  }, [done, navigation, summary]);

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <Text style={styles.title}>{done ? 'We found opportunities.' : 'We’re looking for money.'}</Text>
      {!done ? (
        <>
          <ActivityIndicator color={colors.moneyBright} size="large" style={styles.spinner} />
          <Text style={styles.analyzing}>Analyzing transactions…</Text>
          <View style={styles.steps}>
            {scanSteps.map((step) => (
              <Text key={step.id} style={[styles.step, step.done && styles.stepDone]}>
                {step.done ? '✓' : '·'} {step.label}
              </Text>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.result}>
          <Text style={styles.count}>{resultCount} opportunities</Text>
          <Text style={styles.value}>Potential value</Text>
          <Text style={styles.money}>{formatMoney(resultValue)}</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...type.hero,
    color: colors.text,
    marginBottom: space.xl,
  },
  spinner: {
    marginBottom: space.lg,
  },
  analyzing: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.moneyBright,
    marginBottom: space.lg,
  },
  steps: {
    gap: 10,
  },
  step: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
  },
  stepDone: {
    color: colors.text,
  },
  result: {
    gap: 8,
  },
  count: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: colors.text,
  },
  value: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
  },
  money: {
    ...type.money,
    color: colors.moneyBright,
  },
});
