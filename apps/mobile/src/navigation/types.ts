export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Promise: undefined;
  ConnectAccounts: undefined;
  BankConnect: undefined;
  EmailConnect: undefined;
  Permissions: { institution: string };
  Security: { institution: string };
  Scanning: undefined;
  Main: undefined;
  OpportunityDetail: { id: string };
  ActionPlan: { id: string; selfServe?: boolean };
  Approval: { id: string };
  Tracking: { id: string };
  Success: { id: string };
  Privacy: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Found: undefined;
  Expiring: undefined;
  History: undefined;
  Settings: undefined;
};
