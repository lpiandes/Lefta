import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useAppState } from '../../state/AppState';
import { colors, space, type } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BankConnect'>;

export function BankConnectScreen({ navigation }: Props) {
  const { plaidConfigured } = useAppState();

  return (
    <Screen showBack>
      <Text style={styles.title}>Connect with Plaid</Text>
      <Text style={styles.support}>
        {plaidConfigured
          ? 'You’ll authenticate with your bank through Plaid Link. Find Money never sees your bank password — we store an encrypted provider token only.'
          : 'Bank connect is not available until PLAID_CLIENT_ID, PLAID_SECRET, and PLAID_ENV are set on the API. There is no demo bank path.'}
      </Text>

      <Button
        label="Continue"
        disabled={!plaidConfigured}
        onPress={() => navigation.navigate('Permissions')}
      />
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
});
