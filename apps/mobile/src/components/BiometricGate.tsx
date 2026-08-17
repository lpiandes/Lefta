import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Button } from './Button';
import { colors, fonts, space } from '../theme';

export function BiometricGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [available, setAvailable] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!mounted) return;
        if (!hasHardware || !enrolled) {
          setUnlocked(true);
          setChecking(false);
          return;
        }
        setAvailable(true);
        setChecking(false);
      } catch {
        if (!mounted) return;
        setUnlocked(true);
        setChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function unlock() {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Find Money',
      cancelLabel: 'Cancel',
    });
    if (result.success) setUnlocked(true);
  }

  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.moneyBright} />
      </View>
    );
  }

  if (!unlocked && available) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Unlock Find Money</Text>
        <Text style={styles.body}>Use Face ID, Touch ID, or your device passcode.</Text>
        <Button label="Unlock" onPress={() => void unlock()} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    marginBottom: space.sm,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: space.xl,
    textAlign: 'center',
  },
});
