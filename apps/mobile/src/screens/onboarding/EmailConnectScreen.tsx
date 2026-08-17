import { Alert, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { CheckRow } from '../../components/CheckRow';
import { Screen } from '../../components/Screen';
import { colors, space, type } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EmailConnect'>;

export function EmailConnectScreen({ navigation }: Props) {
  return (
    <Screen showBack>
      <Text style={styles.title}>Connect email for purchase protection</Text>
      <Text style={styles.support}>
        A charge on your bank feed is only part of the story. Email can reveal the receipt, order
        number, return policy, and warranty — which can increase what we can recover.
      </Text>

      <Text style={styles.subtitle}>Narrow permissions</Text>
      <CheckRow label="Search receipts and purchase-related messages" />
      <CheckRow label="Read your entire email" positive={false} />

      <Button
        label="Continue with Google / Microsoft"
        onPress={() => {
          Alert.alert(
            'Email connect is not live yet',
            'Google and Microsoft OAuth need app review. Connect a bank first — that’s how Find Money finds money today.',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
        }}
        style={{ marginTop: space.xl }}
      />
      <Button
        label="Skip for now"
        variant="ghost"
        onPress={() => navigation.goBack()}
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
