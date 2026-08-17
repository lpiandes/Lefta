import { useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { useAppState } from '../../state/AppState';
import { colors, type } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PlaidLink'>;

export function PlaidLinkScreen({ navigation, route }: Props) {
  const { completePlaidLink, completeOnboarding } = useAppState();
  const handled = useRef(false);

  async function onSuccess(publicToken: string, institutionName?: string, institutionId?: string) {
    if (handled.current) return;
    handled.current = true;
    await completePlaidLink({ publicToken, institutionName, institutionId });
    completeOnboarding();
    navigation.replace('Scanning');
  }

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <Text style={styles.title}>Connect with Plaid</Text>
      <WebView
        source={{
          uri: `https://cdn.plaid.com/link/v2/stable/link.html?isWebview=true&token=${encodeURIComponent(route.params.linkToken)}`,
        }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            const action = String(data.action ?? data.eventName ?? '');
            if (action.includes('connected') || data.public_token) {
              const token = data.public_token ?? data.metadata?.public_token;
              const name = data.institution_name ?? data.metadata?.institution?.name;
              const institutionId = data.institution_id ?? data.metadata?.institution?.institution_id;
              if (token) void onSuccess(token, name, institutionId);
            }
            if (action.includes('exit') || action.includes('close')) {
              navigation.goBack();
            }
          } catch {
            // ignore non-JSON
          }
        }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.moneyBright} />
          </View>
        )}
        style={styles.web}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 0 },
  title: {
    ...type.section,
    color: colors.text,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  web: { flex: 1, backgroundColor: colors.ink },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
