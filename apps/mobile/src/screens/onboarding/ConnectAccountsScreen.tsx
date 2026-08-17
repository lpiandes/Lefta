import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { colors, fonts, radii, space, type } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ConnectAccounts'>;

const OPTIONS = [
  { emoji: '🏦', title: 'Bank account', route: 'BankConnect' as const },
  { emoji: '💳', title: 'Credit card', route: 'BankConnect' as const },
  { emoji: '📧', title: 'Email / receipts', route: 'EmailConnect' as const },
  { emoji: '🧾', title: 'Upload bills', route: 'UploadBills' as const },
];

export function ConnectAccountsScreen({ navigation }: Props) {
  return (
    <Screen showBack>
      <Text style={styles.title}>Connect your financial accounts</Text>
      <Text style={styles.support}>
        The more information Find Money can analyze, the more opportunities it can find. Start with
        one — you don’t need everything.
      </Text>

      <View style={styles.list}>
        {OPTIONS.map((opt) => (
          <Button
            key={opt.title}
            label={`${opt.emoji}  ${opt.title}`}
            variant="ghost"
            onPress={() => navigation.navigate(opt.route)}
            style={styles.option}
          />
        ))}
      </View>

      <Text style={styles.note}>
        Bank connections use Plaid Link. Find Money never stores your bank password.
      </Text>
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
    marginBottom: space.lg,
  },
  option: {
    borderRadius: radii.md,
    justifyContent: 'flex-start',
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
});
