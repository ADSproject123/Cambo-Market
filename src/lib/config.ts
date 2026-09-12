import dotenv from 'dotenv';
dotenv.config({ path: ['.env.local', '.env'] });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

// Getters, not a plain object literal: required() must only run when a field
// is actually READ, not merely when this module is imported. Every page
// transitively imports this module via the root layout, and Next.js
// statically prerenders a few routes (e.g. the auto-generated /_not-found)
// at BUILD time — Vercel deliberately withholds Secret-type env vars during
// that static-generation phase (they're only injected into real request-time
// serverless function invocations), so an eager, module-scope required()
// call here would crash the entire production build over a page that never
// actually needs these values.
export const config = {
  get botToken() {
    return required('BOT_TOKEN');
  },
  get adminChatIds() {
    return required('ADMIN_CHAT_IDS')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .map(Number);
  },
  get supabaseUrl() {
    return required('NEXT_PUBLIC_SUPABASE_URL');
  },
  get supabaseServiceRoleKey() {
    return required('SUPABASE_SERVICE_ROLE_KEY');
  },
  get paymentQrImagePath() {
    return process.env.PAYMENT_QR_IMAGE_PATH || './assets/payment-qr.png';
  },
  get paymentInstructions() {
    return process.env.PAYMENT_INSTRUCTIONS || 'Contact admin for payment details.';
  },
  get serviceFeePercent() {
    return Number(process.env.SERVICE_FEE_PERCENT ?? '8');
  },
  /** Flat USD markup added on top of a catalog product's G2G price (per the business rule: always $1 above G2G). */
  get catalogMarkupUsd() {
    return Number(process.env.CATALOG_MARKUP_USD ?? '1');
  },
  get defaultCurrency() {
    return process.env.DEFAULT_CURRENCY || 'USD';
  },
  get scraperProxyUrl() {
    return process.env.SCRAPER_PROXY_URL || undefined;
  },
  get webAppUrl() {
    return process.env.WEB_APP_URL || 'https://example.com';
  },
};
