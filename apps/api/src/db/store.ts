import { MemoryStore } from './memoryStore';
import type { DataStore } from './types';
import { loadConfig } from '../lib/config';

let store: DataStore | undefined;

export function usesPostgres(): boolean {
  return Boolean(loadConfig().databaseUrl);
}

export async function getStore(): Promise<DataStore> {
  if (store) return store;
  if (usesPostgres()) {
    const { PrismaStore } = await import('./prismaStore');
    store = new PrismaStore();
    return store;
  }
  store = new MemoryStore();
  return store;
}

/** Tests can inject a fresh memory store. */
export function setStoreForTests(next: DataStore): void {
  store = next;
}
