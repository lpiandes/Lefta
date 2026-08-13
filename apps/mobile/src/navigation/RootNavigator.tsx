import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors, fonts } from '../theme';
import type { MainTabParamList, RootStackParamList } from './types';

import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { PromiseScreen } from '../screens/onboarding/PromiseScreen';
import { ConnectAccountsScreen } from '../screens/onboarding/ConnectAccountsScreen';
import { BankConnectScreen } from '../screens/onboarding/BankConnectScreen';
import { EmailConnectScreen } from '../screens/onboarding/EmailConnectScreen';
import { PermissionsScreen } from '../screens/onboarding/PermissionsScreen';
import { SecurityScreen } from '../screens/onboarding/SecurityScreen';
import { ScanningScreen } from '../screens/onboarding/ScanningScreen';
import { HomeScreen } from '../screens/main/HomeScreen';
import { FoundScreen } from '../screens/main/FoundScreen';
import { ExpiringScreen } from '../screens/main/ExpiringScreen';
import { HistoryScreen } from '../screens/main/HistoryScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { PrivacyScreen } from '../screens/settings/PrivacyScreen';
import { OpportunityDetailScreen } from '../screens/opportunity/OpportunityDetailScreen';
import { ActionPlanScreen } from '../screens/opportunity/ActionPlanScreen';
import { ApprovalScreen } from '../screens/opportunity/ApprovalScreen';
import { TrackingScreen } from '../screens/opportunity/TrackingScreen';
import { SuccessScreen } from '../screens/opportunity/SuccessScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.ink,
    card: colors.inkElevated,
    text: colors.text,
    border: colors.border,
    primary: colors.moneyBright,
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.inkElevated,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.moneyBright,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: fonts.bodyMedium,
          fontSize: 11,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon label="$" color={color} />,
        }}
      />
      <Tab.Screen
        name="Found"
        component={FoundScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon label="◎" color={color} />,
        }}
      />
      <Tab.Screen
        name="Expiring"
        component={ExpiringScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon label="⏱" color={color} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon label="☰" color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon label="⚙" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function TabIcon({ label, color }: { label: string; color: string }) {
  return <Text style={{ color, fontSize: 16 }}>{label}</Text>;
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Promise" component={PromiseScreen} />
        <Stack.Screen name="ConnectAccounts" component={ConnectAccountsScreen} />
        <Stack.Screen name="BankConnect" component={BankConnectScreen} />
        <Stack.Screen name="EmailConnect" component={EmailConnectScreen} />
        <Stack.Screen name="Permissions" component={PermissionsScreen} />
        <Stack.Screen name="Security" component={SecurityScreen} />
        <Stack.Screen name="Scanning" component={ScanningScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="OpportunityDetail" component={OpportunityDetailScreen} />
        <Stack.Screen name="ActionPlan" component={ActionPlanScreen} />
        <Stack.Screen name="Approval" component={ApprovalScreen} />
        <Stack.Screen name="Tracking" component={TrackingScreen} />
        <Stack.Screen name="Success" component={SuccessScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
