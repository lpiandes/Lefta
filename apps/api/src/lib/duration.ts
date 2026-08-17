const UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/** Parses values like `15m`, `7d`, `30s`. */
export function parseDurationMs(value: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration "${value}". Use a number plus ms, s, m, h, or d.`);
  }
  return Number(match[1]) * UNIT_MS[match[2]];
}

export function isoDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function daysAgoDate(days: number, from = new Date()): Date {
  const next = new Date(from);
  next.setUTCDate(next.getUTCDate() - days);
  return next;
}
