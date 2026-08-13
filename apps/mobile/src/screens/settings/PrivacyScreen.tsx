import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { CheckRow } from '../../components/CheckRow';
import { Screen } from '../../components/Screen';
import { colors, space, type } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Privacy'>;

const COMMITMENTS = [
  'We don’t sell your financial data.',
  'We don’t sell transaction histories.',
  'We don’t use financial information for advertising.',
  'You control connected accounts.',
  'You can disconnect at any time.',
  'You can delete your account and data.',
];

export function PrivacyScreen({ navigation }: Props) {
  return (
    <Screen>
      <Text style={styles.title}>Your Money. Your Data.</Text>
      <Text style={styles.support}>
        Privacy is a product feature. These commitments only hold if the architecture supports them —
        this MVP is built around data minimization and read-only access.
      </Text>

      {COMMITMENTS.map((c) => (
        <CheckRow key={c} label={c} />
      ))}

      <Button label="Back" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: space.xl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.title,
    color: colors.text,
    marginBottom: space.md,
  },
  support: {
    ...type.body,
    color: colors.textMuted,
    marginBottom: space.lg,
  },
});
