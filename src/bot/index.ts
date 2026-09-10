import dns from 'node:dns';
import net from 'node:net';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { config } from '../lib/config';
import { logger } from '../lib/logger';
import { CATALOG_CATEGORIES, syncAllCategories, syncCategory } from '../lib/catalogSync';
import { isAdminContext } from './auth';
import { handleStart } from './handlers/start';
import { handleLookup } from './handlers/lookup';
import {
  handleShowCategoryMenu,
  handleShowCatalog,
  handleProductDetailCallback,
  handleProductBuyCallback,
} from './handlers/catalog';
import { handleBuyCallback, handleCancelCallback, handlePaymentScreenshot } from './handlers/order';
import { handleApproveCallback, handleRejectCallback, handleAdminReply } from './handlers/admin';

// This host has no working IPv6 route, and the real (IPv4) connection to
// Telegram's servers sometimes takes longer than Node's default 250ms
// Happy-Eyeballs per-attempt cutoff (autoSelectFamily), which made `fetch`
// give up and report ETIMEDOUT well before a plain `curl` would have
// succeeded. Preferring IPv4 and disabling that race fixes both.
dns.setDefaultResultOrder('ipv4first');
net.setDefaultAutoSelectFamily(false);

export const bot = new Telegraf(config.botToken);

bot.start((ctx) => handleStart(ctx));

bot.command('sync', async (ctx) => {
  if (!isAdminContext(ctx)) return;

  // "/sync <slug>" refreshes one arbitrary G2G category on demand (e.g. one
  // just added on the web admin). Plain "/sync" refreshes every category
  // this bot knows how to auto-scrape (CATALOG_CATEGORIES) — manually
  // imported categories (e.g. from G2A) aren't G2G-scrapable and are
  // intentionally left alone here; manage those via the web admin.
  const arg = ctx.message.text.split(/\s+/)[1];
  const categories = arg ? [arg] : CATALOG_CATEGORIES;

  await ctx.reply(`Syncing ${categories.join(', ')}…`);
  for (const category of categories) {
    try {
      const count = await syncCategory(category);
      await ctx.reply(`✅ ${category}: ${count} listings.`);
    } catch (err) {
      await ctx.reply(`❌ ${category}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
});

bot.action('catalog_menu', (ctx) => handleShowCategoryMenu(ctx));
bot.action(/^catalog:/, (ctx) => {
  const data = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : undefined;
  const parts = data?.split(':');
  const category = parts?.[1];
  if (!category) return;
  const pageRaw = Number(parts?.[2]);
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  return handleShowCatalog(ctx, category, page);
});
bot.action(/^product:/, (ctx) => handleProductDetailCallback(ctx));
bot.action(/^product_buy:/, (ctx) => handleProductBuyCallback(ctx));

bot.action(/^buy:/, (ctx) => handleBuyCallback(ctx));
bot.action(/^cancel:/, (ctx) => handleCancelCallback(ctx));
bot.action(/^approve:/, (ctx) => handleApproveCallback(ctx));
bot.action(/^reject:/, (ctx) => handleRejectCallback(ctx));

bot.on(message('photo'), (ctx) => handlePaymentScreenshot(ctx, bot));

bot.on(message('text'), (ctx) => {
  const isReply = 'reply_to_message' in ctx.message && !!ctx.message.reply_to_message;
  if (isAdminContext(ctx) && isReply) {
    return handleAdminReply(ctx, bot);
  }
  return handleLookup(ctx, bot);
});

bot.catch((err, ctx) => {
  logger.error(`Unhandled error for update ${ctx.updateType}`, err);
});

// Run in long-polling mode if executed directly locally
if (process.env.NODE_ENV !== 'production' && process.argv[1]?.includes('src/bot/index.ts')) {
  bot.launch();
  logger.info('Bot started locally in polling mode');
  
  import('../lib/catalogSync').then(({ syncAllCategories }) => {
    syncAllCategories().catch((err: any) => logger.error('Initial catalog sync failed', err));
  });

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
