import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { config } from './config.js';
import { logger } from './logger.js';
import { isAdminContext } from './bot/auth.js';
import { handleStart } from './bot/handlers/start.js';
import { handleLookup } from './bot/handlers/lookup.js';
import { handleBuyCallback, handleCancelCallback, handlePaymentScreenshot } from './bot/handlers/order.js';
import { handleApproveCallback, handleRejectCallback, handleAdminReply } from './bot/handlers/admin.js';

const bot = new Telegraf(config.botToken);

bot.start((ctx) => handleStart(ctx));

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

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
