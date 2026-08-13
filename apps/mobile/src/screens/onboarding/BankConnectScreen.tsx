import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { colors, fonts, radii, space, type } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BankConnect'>;

const BANKS = ['Chase', 'Bank of America', 'Capital One', 'Wells Fargo', 'Citi', 'US Bank'];

export function BankConnectScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const filtered = BANKS.filter((b) => b.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Screen>
      <Text style={styles.title}>Select your bank</Text>
      <Text style={styles.support}>
        Connected through a financial-data provider (Plaid Link). You authenticate with your
        institution — Find Money never sees your bank password.
      </Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search banks"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      <View style={styles.list}>
        {filtered.map((bank) => (
          <Pressable
            key={bank}
            style={styles.row}
            onPress={() => navigation.navigate('Permissions', { institution: bank })}
          >
            <Text style={styles.bank}>{bank}</Text>
            <Text style={styles.chevron}>→</Text>
          </Pressable>
        ))}
      </View>

      <Button label="Back" variant="ghost" onPress={() => navigation.goBack()} />
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
    marginBottom: space.md,
  },
  list: {
    marginBottom: space.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bank: {
    fontFamily: fonts.bodyMedium,
    fontSize: 17,
    color: colors.text,
  },
  chevron: {
    color: colors.moneyBright,
    fontSize: 18,
  },
});
