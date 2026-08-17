import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { colors, space, type } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'UploadBills'>;

export function UploadBillsScreen({ navigation }: Props) {
  return (
    <Screen showBack>
      <Text style={styles.title}>Upload bills</Text>
      <Text style={styles.support}>
        Bill upload is not live yet. Connect a bank account to scan transactions — that’s the path
        that finds money today.
      </Text>
      <Button label="Back to accounts" onPress={() => navigation.goBack()} />
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
});
