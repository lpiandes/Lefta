import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { api } from '../../api/client';
import { colors, fonts, radii, space, type } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Security'>;

const POINTS = [
  { icon: '🔒', text: 'TLS in transit; AES-256-GCM for provider tokens at rest' },
  { icon: '🔐', text: 'Encrypted data at rest in Postgres' },
  { icon: '🛡️', text: 'Read-only access — no money movement' },
  { icon: '🚫', text: 'Bank passwords are never stored' },
  { icon: '🗑️', text: 'Disconnect or delete your data anytime' },
];

export function SecurityScreen({ navigation }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setBusy(true);
    setError(null);
    try {
      const { linkToken } = await api.createLinkToken();
      navigation.replace('PlaidLink', { linkToken });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start bank connect');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen showBack>
      <Text style={styles.title}>Your bank password isn’t stored by Find Money.</Text>
      <Text style={styles.support}>
        Your bank authenticates you through Plaid. The provider does not share your bank credentials
        with this app. We store an encrypted access token only.
      </Text>

      <View style={styles.list}>
        {POINTS.map((p) => (
          <View key={p.text} style={styles.row}>
            <Text style={styles.icon}>{p.icon}</Text>
            <Text style={styles.text}>{p.text}</Text>
          </View>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label={busy ? 'Connecting…' : 'Open Plaid Link'} onPress={() => void connect()} disabled={busy} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.title,
    color: colors.text,
    marginTop: space.md,
    marginBottom: space.md,
  },
  support: {
    ...type.body,
    color: colors.textMuted,
    marginBottom: space.xl,
  },
  list: {
    gap: space.sm,
    marginBottom: space.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radii.md,
    backgroundColor: colors.inkElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    fontSize: 20,
  },
  text: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
  },
  error: {
    fontFamily: fonts.body,
    color: colors.danger,
    marginBottom: space.md,
  },
});
