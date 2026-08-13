import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { CheckRow } from '../../components/CheckRow';
import { Screen } from '../../components/Screen';
import { colors, space, type } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Permissions'>;

export function PermissionsScreen({ navigation, route }: Props) {
  return (
    <Screen>
      <Text style={styles.title}>What Find Money can access</Text>
      <Text style={styles.support}>Connecting {route.params.institution}</Text>

      <View style={styles.block}>
        <CheckRow label="Account information" />
        <CheckRow label="Transactions" />
        <CheckRow label="Balances" />
      </View>

      <Text style={styles.subtitle}>What Find Money cannot do</Text>
      <View style={styles.block}>
        <CheckRow label="Transfer money" positive={false} />
        <CheckRow label="Withdraw money" positive={false} />
        <CheckRow label="Move money" positive={false} />
        <CheckRow label="Make purchases" positive={false} />
      </View>

      <Text style={styles.note}>
        MVP is a read-only financial intelligence product — a major safety and trust advantage.
      </Text>

      <Button
        label="Continue"
        onPress={() => navigation.navigate('Security', { institution: route.params.institution })}
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
  subtitle: {
    ...type.section,
    color: colors.text,
    marginTop: space.md,
    marginBottom: space.md,
  },
  block: {
    marginBottom: space.md,
  },
  note: {
    ...type.body,
    color: colors.goldSoft,
    marginBottom: space.xl,
  },
});
