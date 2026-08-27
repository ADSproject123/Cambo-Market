export function applyServiceFee(price: number, feePercent: number): number {
  return Math.round(price * (1 + feePercent / 100) * 100) / 100;
}

export const CATALOG_MARKUP_USD = Number(process.env.CATALOG_MARKUP_USD ?? '1');

export function sellPrice(basePrice: number): number {
  return Math.round((basePrice + CATALOG_MARKUP_USD) * 100) / 100;
}

export function formatMoney(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency}`;
}
