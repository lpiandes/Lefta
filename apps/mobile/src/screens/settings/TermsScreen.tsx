import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckRow } from '../../components/CheckRow';
import { Screen } from '../../components/Screen';
import { colors, space, type } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Terms'>;

const TERMS = [
  'Find Money is a read-only money-recovery assistant. Findings are opportunities, not guarantees, until cash is verified.',
  'You approve every consequential action. We do not move money or auto-file disputes.',
  'The app is free. A 20% success fee applies only to verified recovered cash — never hypothetical savings.',
  'You send merchant requests using drafts we prepare, unless a later permitted integration is enabled.',
  'You may disconnect accounts and delete your data at any time.',
];

export function TermsScreen(_props: Props) {
  return (
    <Screen showBack>
      <Text style={styles.title}>Terms of use</Text>
      <Text style={styles.support}>
        These terms match the product: we never take custody of recovered funds. Confirm with counsel
        before charging live users.
      </Text>
      {TERMS.map((t) => (
        <CheckRow key={t} label={t} />
      ))}
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
