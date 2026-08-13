/** Format cents-safe money for display (USD). */
export function formatMoney(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: safe % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(safe);
}

export function formatCompactDate(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatFullDate(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function daysUntil(iso: string, now = new Date()): number {
  const target = new Date(iso).getTime();
  const start = now.getTime();
  return Math.ceil((target - start) / (1000 * 60 * 60 * 24));
}

/** Success fee: 20% of verified recovered cash only. */
export const SUCCESS_FEE_RATE = 0.2;

export function calculateSuccessFee(recoveredAmount: number): number {
  if (recoveredAmount <= 0) return 0;
  return Math.round(recoveredAmount * SUCCESS_FEE_RATE * 100) / 100;
}

export function userKeepsAfterFee(recoveredAmount: number): number {
  return Math.round((recoveredAmount - calculateSuccessFee(recoveredAmount)) * 100) / 100;
}
