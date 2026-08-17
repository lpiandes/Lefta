export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Promise: undefined;
  Auth: undefined;
  ConnectAccounts: undefined;
  BankConnect: undefined;
  PlaidLink: { linkToken: string };
  EmailConnect: undefined;
  UploadBills: undefined;
  Permissions: undefined;
  Security: undefined;
  Scanning: undefined;
  Main: undefined;
  OpportunityDetail: { id: string };
  ActionPlan: { id: string; selfServe?: boolean };
  Approval: { id: string };
  Tracking: { id: string };
  Success: { id: string };
  Privacy: undefined;
  Terms: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Found: undefined;
  Expiring: undefined;
  History: undefined;
  Settings: undefined;
};
