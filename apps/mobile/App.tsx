import { useCallback, type ReactNode } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppStateProvider } from './src/state/AppState';
import { BiometricGate } from './src/components/BiometricGate';
import { colors } from './src/theme';

function PhoneShell({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#020807',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 390,
          height: 844,
          maxHeight: '100%',
          borderRadius: 40,
          overflow: 'hidden',
          borderWidth: 10,
          borderColor: '#12241e',
        }}
      >
        {children}
      </View>
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const ready = useCallback(() => fontsLoaded, [fontsLoaded]);

  if (!ready()) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink }}>
        <ActivityIndicator color={colors.moneyBright} />
      </View>
    );
  }

  return (
    <PhoneShell>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppStateProvider>
            <BiometricGate>
              <StatusBar style="light" />
              <RootNavigator />
            </BiometricGate>
          </AppStateProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </PhoneShell>
  );
}
