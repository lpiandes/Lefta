import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandMark } from '../../components/BrandMark';
import { Screen } from '../../components/Screen';
import { useAppState } from '../../state/AppState';
import { colors, fonts, space } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const { ready, user, hasScanned, bankConnected } = useAppState();

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      if (user && hasScanned) navigation.replace('Main');
      else if (user && bankConnected) navigation.replace('Scanning');
      else if (user) navigation.replace('ConnectAccounts');
      else navigation.replace('Onboarding');
    }, 900);
    return () => clearTimeout(t);
  }, [ready, user, hasScanned, bankConnected, navigation]);

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.center}>
        <BrandMark size="lg" tagline />
        <Text style={styles.pulse}>Find → Explain → Act → Recover</Text>
        {!ready ? <ActivityIndicator color={colors.moneyBright} style={{ marginTop: space.lg }} /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  center: {
    gap: space.lg,
  },
  pulse: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.moneyBright,
    letterSpacing: 0.4,
  },
});
