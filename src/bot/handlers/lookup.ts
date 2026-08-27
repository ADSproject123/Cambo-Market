import type { Context, Telegraf } from 'telegraf';
import { config } from '../../lib/config.js';
import { createOrder } from '../../lib/db/orders.js';
import { upsertUserFromCtx } from '../../lib/db/users.js';
import { applyServiceFee, formatMoney } from '../../lib/pricing.js';
import { detectMarketplace, scrapeProduct } from '../../lib/scrapers/index.js';
import { notifyAdmins } from '../notifyAdmins.js';
import { buyOrCancelKeyboard } from '../keyboards.js';

const URL_RE = /https?:\/\/\S+/i;

export async function handleLookup(ctx: Context, bot: Telegraf): Promise<void> {
  const text = ctx.message && 'text' in ctx.message ? ctx.message.text : undefined;
  const match = text?.match(URL_RE);

  if (!match) {
    await ctx.reply('Send me a product link to get a quote.');
    return;
  }

  const url = match[0];
  const marketplace = detectMarketplace(url);
  if (!marketplace) {
    await ctx.reply("Sorry, I can't quote that link — please paste a supported product link.");
    return;
  }

  await upsertUserFromCtx(ctx);
  const statusMsg = await ctx.reply('🔎 Checking that link…');

  const result = await scrapeProduct(url, marketplace);
  const telegramUserId = ctx.from!.id;

  if (result.ok && result.product) {
    const total = applyServiceFee(result.product.price, config.serviceFeePercent);
    const order = await createOrder({
      telegramUserId,
      marketplace,
      productUrl: url,
      productTitle: result.product.title,
      scrapedPrice: result.product.price,
      currency: result.product.currency,
      serviceFeePercent: config.serviceFeePercent,
      totalAmount: total,
      status: 'draft',
    });

    const estimateNote = result.product.isEstimate
      ? '\n⚠️ This is an estimated price — an admin will confirm the exact price before you pay.'
      : '';

    await ctx.telegram.editMessageText(
      ctx.chat!.id,
      statusMsg.message_id,
      undefined,
      [
        `<b>${escapeHtml(result.product.title)}</b>`,
        `Price: ${formatMoney(result.product.price, result.product.currency)}`,
        `Total to pay (incl. service fee): <b>${formatMoney(total, result.product.currency)}</b>`,
        estimateNote,
      ]
        .filter(Boolean)
        .join('\n'),
      { parse_mode: 'HTML', ...buyOrCancelKeyboard(order.id) },
    );
    return;
  }

  // Scrape failed — fall back to a manual quote from an admin.
  const order = await createOrder({
    telegramUserId,
    marketplace,
    productUrl: url,
    productTitle: null,
    scrapedPrice: null,
    currency: config.defaultCurrency,
    serviceFeePercent: config.serviceFeePercent,
    totalAmount: null,
    status: 'needs_quote',
  });

  await ctx.telegram.editMessageText(
    ctx.chat!.id,
    statusMsg.message_id,
    undefined,
    "I couldn't fetch the price automatically for that link. I've asked an admin to confirm it manually — I'll message you here as soon as they reply.",
  );

  await notifyAdmins(
    bot.telegram,
    order,
    [
      '🆕 <b>Manual quote needed</b>',
      `Marketplace: ${marketplace}`,
      `Buyer: ${ctx.from?.username ? '@' + ctx.from.username : telegramUserId}`,
      `Link: ${url}`,
      `Scrape error: ${escapeHtml(result.error ?? 'unknown')}`,
      '',
      `Reply to <b>this message</b> with just the price (e.g. <code>24.99</code>) to quote the buyer.`,
    ].join('\n'),
  );
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
