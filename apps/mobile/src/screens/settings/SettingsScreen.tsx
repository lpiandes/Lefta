import type { ReactNode } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { useAppState } from '../../state/AppState';
import { colors, fonts, space, type } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function SettingsScreen({ navigation }: Props) {
  const { accounts, connections, userName, disconnectAll, deleteData } = useAppState();

  return (
    <Screen>
      <Text style={styles.title}>Settings</Text>

      <Section title="Account">
        <Line label="Name" value={userName} />
        <Line label="Email" value="alex@example.com" />
        <Line label="Plan" value="Free · 20% success fee on recovered cash" />
      </Section>

      <Section title="Accounts">
        {connections.length === 0 ? (
          <Text style={styles.muted}>No accounts connected.</Text>
        ) : (
          accounts.map((a) => (
            <Line
              key={a.id}
              label={`${a.institutionName} ${a.name}`}
              value={`•••• ${a.mask}`}
            />
          ))
        )}
        <Button
          label="Connect another account"
          variant="ghost"
          onPress={() => navigation.navigate('ConnectAccounts')}
          style={{ marginTop: space.sm }}
        />
      </Section>

      <Section title="Privacy">
        <Button label="Your Money. Your Data." variant="ghost" onPress={() => navigation.navigate('Privacy')} />
        <Button
          label="Disconnect accounts"
          variant="ghost"
          onPress={() => {
            disconnectAll();
            Alert.alert('Disconnected', 'Financial connections removed.');
          }}
        />
        <Button
          label="Delete my data"
          variant="danger"
          onPress={() => {
            deleteData();
            Alert.alert('Deleted', 'Your demo financial data was cleared.');
            navigation.getParent()?.navigate('Splash');
          }}
          style={{ marginTop: space.sm }}
        />
      </Section>

      <Section title="Security">
        <Line label="Face ID / Passcode" value="Ready for production wiring" />
        <Line label="MFA" value="Recommended at launch" />
        <Line label="Access mode" value="Read-only" />
      </Section>

      <Section title="Notifications">
        <Line label="Money found" value="On" />
        <Line label="Expiring money" value="On" />
        <Line label="Potential errors" value="On" />
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.line}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...type.title,
    color: colors.text,
    marginBottom: space.lg,
  },
  section: {
    marginBottom: space.xl,
  },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.moneyBright,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: space.sm,
  },
  line: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
  },
  value: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  muted: {
    fontFamily: fonts.body,
    color: colors.textMuted,
  },
});
