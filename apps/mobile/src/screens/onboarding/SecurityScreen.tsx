import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useAppState } from '../../state/AppState';
import { colors, fonts, radii, space, type } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Security'>;

const POINTS = [
  { icon: '🔒', text: 'Bank-level encryption in transit (TLS)' },
  { icon: '🔐', text: 'Encrypted data at rest' },
  { icon: '🛡️', text: 'Read-only access' },
  { icon: '🚫', text: 'No ability to move your money' },
  { icon: '🗑️', text: 'Delete your data anytime' },
];

export function SecurityScreen({ navigation, route }: Props) {
  const { connectBank, completeOnboarding } = useAppState();

  return (
    <Screen>
      <Text style={styles.title}>Your bank password isn’t stored by Find Money.</Text>
      <Text style={styles.support}>
        With OAuth connections, {route.params.institution} authenticates you and provides authorized
        access. The provider does not share your bank credentials with this app.
      </Text>

      <View style={styles.list}>
        {POINTS.map((p) => (
          <View key={p.text} style={styles.row}>
            <Text style={styles.icon}>{p.icon}</Text>
            <Text style={styles.text}>{p.text}</Text>
          </View>
        ))}
      </View>

      <Button
        label="Connect & Scan"
        onPress={() => {
          connectBank();
          completeOnboarding();
          navigation.replace('Scanning');
        }}
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
  list: {
    gap: space.sm,
    marginBottom: space.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radii.md,
    backgroundColor: colors.inkElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    fontSize: 20,
  },
  text: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
  },
});
