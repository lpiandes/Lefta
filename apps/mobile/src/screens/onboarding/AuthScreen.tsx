import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useAppState } from '../../state/AppState';
import { colors, fonts, radii, space, type } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export function AuthScreen({ navigation }: Props) {
  const { login, register, user } = useAppState();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      if (mode === 'register') {
        await register({ email, name, password });
      } else {
        await login({ email, password });
      }
      navigation.replace('ConnectAccounts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen showBack>
      <Text style={styles.title}>{mode === 'register' ? 'Create your account' : 'Welcome back'}</Text>
      <Text style={styles.support}>
        Sessions expire automatically. Find Money never stores your bank password.
      </Text>

      {mode === 'register' ? (
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCapitalize="words"
        />
      ) : null}

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder={mode === 'register' ? 'Password (8+ characters)' : 'Password'}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={busy ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
        onPress={() => void submit()}
      />
      <Button
        label={mode === 'register' ? 'I already have an account' : 'Create an account'}
        variant="ghost"
        onPress={() => setMode(mode === 'register' ? 'login' : 'register')}
        style={{ marginTop: space.sm }}
      />
      {user ? (
        <Button
          label="Continue"
          variant="secondary"
          onPress={() => navigation.replace('ConnectAccounts')}
          style={{ marginTop: space.sm }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.title,
    color: colors.text,
    marginTop: space.md,
    marginBottom: space.sm,
  },
  support: {
    ...type.body,
    color: colors.textMuted,
    marginBottom: space.lg,
  },
  input: {
    backgroundColor: colors.inkElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: space.md,
    paddingVertical: 14,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    marginBottom: space.sm,
  },
  error: {
    fontFamily: fonts.body,
    color: colors.danger,
    marginBottom: space.md,
  },
});
