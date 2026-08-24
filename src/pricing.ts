export function applyServiceFee(price: number, feePercent: number): number {
  return Math.round(price * (1 + feePercent / 100) * 100) / 100;
}

export function formatMoney(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency}`;
}
