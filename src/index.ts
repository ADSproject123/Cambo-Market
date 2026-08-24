import dns from 'node:dns';
import net from 'node:net';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { config } from './config.js';
import { logger } from './logger.js';
import { CATALOG_CATEGORIES, syncAllCategories, syncCategory } from './catalogSync.js';
import { isAdminContext } from './bot/auth.js';
import { handleStart } from './bot/handlers/start.js';
import { handleLookup } from './bot/handlers/lookup.js';
import { handleShowCatalog, handleProductDetailCallback, handleProductBuyCallback } from './bot/handlers/catalog.js';
import { handleBuyCallback, handleCancelCallback, handlePaymentScreenshot } from './bot/handlers/order.js';
import { handleApproveCallback, handleRejectCallback, handleAdminReply } from './bot/handlers/admin.js';

// This host has no working IPv6 route, and the real (IPv4) connection to
// Telegram's servers sometimes takes longer than Node's default 250ms
// Happy-Eyeballs per-attempt cutoff (autoSelectFamily), which made `fetch`
// give up and report ETIMEDOUT well before a plain `curl` would have
// succeeded. Preferring IPv4 and disabling that race fixes both.
dns.setDefaultResultOrder('ipv4first');
net.setDefaultAutoSelectFamily(false);

const bot = new Telegraf(config.botToken);

bot.start((ctx) => handleStart(ctx));

bot.command('sync', async (ctx) => {
  if (!isAdminContext(ctx)) return;
  await ctx.reply(`Syncing ${CATALOG_CATEGORIES.join(', ')}…`);
  for (const category of CATALOG_CATEGORIES) {
    try {
      const count = await syncCategory(category);
      await ctx.reply(`✅ ${category}: ${count} listings.`);
    } catch (err) {
      await ctx.reply(`❌ ${category}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
});

bot.action(/^catalog:/, (ctx) => {
  const data = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : undefined;
  const category = data?.split(':')[1];
  if (!category) return;
  return handleShowCatalog(ctx, category);
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

bot.launch();
logger.info('Bot started');

syncAllCategories().catch((err) => logger.error('Initial catalog sync failed', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
