import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const config = {
  botToken: required('BOT_TOKEN'),
  adminChatIds: required('ADMIN_CHAT_IDS')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .map(Number),
  supabaseUrl: required('SUPABASE_URL'),
  supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  paymentQrImagePath: process.env.PAYMENT_QR_IMAGE_PATH || './assets/payment-qr.png',
  paymentInstructions: process.env.PAYMENT_INSTRUCTIONS || 'Contact admin for payment details.',
  serviceFeePercent: Number(process.env.SERVICE_FEE_PERCENT ?? '8'),
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'USD',
  scraperProxyUrl: process.env.SCRAPER_PROXY_URL || undefined,
} as const;
