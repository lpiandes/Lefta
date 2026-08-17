import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { CheckRow } from '../../components/CheckRow';
import { Screen } from '../../components/Screen';
import { useAppState } from '../../state/AppState';
import { colors, space, type } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Promise'>;

const ITEMS = [
  'unnecessary charges',
  'subscriptions',
  'unusual bills',
  'potential refunds',
  'price adjustments',
  'unused credits',
  'rewards',
  'other savings opportunities',
];

export function PromiseScreen({ navigation }: Props) {
  const { user } = useAppState();
  return (
    <Screen>
      <Text style={styles.title}>We’ll do the searching.</Text>
      <Text style={styles.support}>Find Money continuously looks for:</Text>

      {ITEMS.map((item) => (
        <CheckRow key={item} label={item} />
      ))}

      <Text style={styles.control}>
        You stay in control. Nothing happens without your approval.
      </Text>

      <Button
        label="Continue"
        onPress={() => navigation.navigate(user ? 'ConnectAccounts' : 'Auth')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.hero,
    color: colors.text,
    marginBottom: space.md,
    marginTop: space.md,
  },
  support: {
    ...type.body,
    color: colors.textMuted,
    marginBottom: space.lg,
  },
  control: {
    ...type.body,
    color: colors.goldSoft,
    marginTop: space.lg,
    marginBottom: space.xl,
    fontSize: 17,
    lineHeight: 26,
  },
});
