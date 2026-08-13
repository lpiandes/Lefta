import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BrandMark } from '../../components/BrandMark';
import { Screen } from '../../components/Screen';
import { colors, fonts, space } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Onboarding'), 1400);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.center}>
        <BrandMark size="lg" tagline />
        <Text style={styles.pulse}>Find → Explain → Act → Recover</Text>
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
