let counter = 0;

/** Deterministic-ish ids for demo + tests; swap for UUID in production. */
export function createId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

export function resetIdCounter(): void {
  counter = 0;
}
