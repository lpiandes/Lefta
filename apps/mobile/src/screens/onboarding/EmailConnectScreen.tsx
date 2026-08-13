import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { CheckRow } from '../../components/CheckRow';
import { Screen } from '../../components/Screen';
import { colors, space, type } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EmailConnect'>;

export function EmailConnectScreen({ navigation }: Props) {
  return (
    <Screen>
      <Text style={styles.title}>Connect email for purchase protection</Text>
      <Text style={styles.support}>
        Your bank says you spent $199 at Best Buy. Your email can reveal the receipt, order number,
        return policy, and warranty — which dramatically increases what we can find.
      </Text>

      <Text style={styles.subtitle}>Narrow permissions</Text>
      <CheckRow label="Search receipts and purchase-related messages" />
      <CheckRow label="Read your entire email" positive={false} />

      <Button
        label="Continue with Google / Microsoft"
        onPress={() => navigation.navigate('BankConnect')}
        style={{ marginTop: space.xl }}
      />
      <Button
        label="Skip for now"
        variant="ghost"
        onPress={() => navigation.navigate('BankConnect')}
        style={{ marginTop: space.sm }}
      />
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
  subtitle: {
    ...type.section,
    color: colors.text,
    marginBottom: space.md,
  },
});
