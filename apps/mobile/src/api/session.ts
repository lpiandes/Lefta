import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'find_money_access_jwt';
const REFRESH_KEY = 'find_money_refresh_token';
const LEGACY_KEY = 'find_money_jwt';

type SecretName = 'access' | 'refresh';

const KEYS: Record<SecretName, string> = {
  access: ACCESS_KEY,
  refresh: REFRESH_KEY,
};

const memory: Record<SecretName, string | null> = {
  access: null,
  refresh: null,
};

async function readNative(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function writeNative(key: string, value: string | null): Promise<void> {
  try {
    if (value) await SecureStore.setItemAsync(key, value);
    else await SecureStore.deleteItemAsync(key);
  } catch {
    // web / unsupported
  }
}

export async function getSecret(name: SecretName): Promise<string | null> {
  if (memory[name]) return memory[name];
  if (Platform.OS === 'web') {
    return localStorage.getItem(KEYS[name]);
  }
  const stored = await readNative(KEYS[name]);
  if (stored) return stored;
  if (name === 'access') {
    const legacy = await readNative(LEGACY_KEY);
    if (legacy) {
      await setSecret('access', legacy);
      await writeNative(LEGACY_KEY, null);
      return legacy;
    }
  }
  return null;
}

export async function setSecret(name: SecretName, value: string | null): Promise<void> {
  memory[name] = value;
  if (Platform.OS === 'web') {
    if (value) localStorage.setItem(KEYS[name], value);
    else localStorage.removeItem(KEYS[name]);
    return;
  }
  await writeNative(KEYS[name], value);
}

export async function getToken(): Promise<string | null> {
  return getSecret('access');
}

export async function getRefreshToken(): Promise<string | null> {
  return getSecret('refresh');
}

export async function setSession(tokens: { token: string; refreshToken?: string } | null): Promise<void> {
  if (!tokens) {
    await setSecret('access', null);
    await setSecret('refresh', null);
    return;
  }
  await setSecret('access', tokens.token);
  if (tokens.refreshToken) await setSecret('refresh', tokens.refreshToken);
}

export async function setToken(token: string | null): Promise<void> {
  if (!token) {
    await setSession(null);
    return;
  }
  await setSecret('access', token);
}

export async function clearToken(): Promise<void> {
  await setSession(null);
}
