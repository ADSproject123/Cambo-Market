import fs from 'node:fs';
import type { Context, Telegraf } from 'telegraf';
import { config } from '../../config.js';
import { findLatestOrderByUserAndStatus, getOrder, updateOrder } from '../../db/orders.js';
import { formatMoney } from '../../pricing.js';
import { notifyAdminsWithPhoto } from '../notifyAdmins.js';
import { approveRejectKeyboard, cancelOnlyKeyboard } from '../keyboards.js';

function shortRef(orderId: string): string {
  return orderId.slice(0, 8).toUpperCase();
}

export async function handleBuyCallback(ctx: Context): Promise<void> {
  const data = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : undefined;
  const orderId = data?.split(':')[1];
  if (!orderId) return;

  const order = await getOrder(orderId);
  if (!order || order.telegram_user_id !== ctx.from?.id) {
    await ctx.answerCbQuery('Order not found.');
    return;
  }
  if (order.status !== 'draft' || !order.total_amount) {
    await ctx.answerCbQuery('This order is no longer available to pay.');
    return;
  }

  await updateOrder(order.id, { status: 'awaiting_payment' });
  await ctx.answerCbQuery();

  const caption = [
    `💳 Order <b>${shortRef(order.id)}</b>`,
    `Amount to pay: <b>${formatMoney(order.total_amount, order.currency)}</b>`,
    '',
    config.paymentInstructions,
    '',
    'After paying, send me a screenshot of the payment as proof.',
  ].join('\n');

  if (fs.existsSync(config.paymentQrImagePath)) {
    await ctx.replyWithPhoto(
      { source: fs.createReadStream(config.paymentQrImagePath) },
      { caption, parse_mode: 'HTML', ...cancelOnlyKeyboard(order.id) },
    );
  } else {
    await ctx.reply(caption, { parse_mode: 'HTML', ...cancelOnlyKeyboard(order.id) });
  }
}

export async function handleCancelCallback(ctx: Context): Promise<void> {
  const data = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : undefined;
  const orderId = data?.split(':')[1];
  if (!orderId) return;

  const order = await getOrder(orderId);
  if (!order || order.telegram_user_id !== ctx.from?.id) {
    await ctx.answerCbQuery('Order not found.');
    return;
  }
  if (!['draft', 'needs_quote', 'awaiting_payment'].includes(order.status)) {
    await ctx.answerCbQuery('This order can no longer be cancelled.');
    return;
  }

  await updateOrder(order.id, { status: 'cancelled' });
  await ctx.answerCbQuery('Cancelled.');
  await ctx.reply(`Order ${shortRef(order.id)} cancelled.`);
}

export async function handlePaymentScreenshot(ctx: Context, bot: Telegraf): Promise<void> {
  const message = ctx.message;
  if (!message || !('photo' in message) || !ctx.from) return;

  const order = await findLatestOrderByUserAndStatus(ctx.from.id, ['awaiting_payment']);
  if (!order) {
    await ctx.reply("I don't have a pending order waiting for payment. Paste a product link to start one.");
    return;
  }

  const photos = message.photo;
  const fileId = photos[photos.length - 1].file_id;

  await updateOrder(order.id, { payment_screenshot_file_id: fileId, status: 'pending_review' });
  await ctx.reply(`Got it! Order ${shortRef(order.id)} is waiting for admin confirmation.`);

  const caption = [
    '🧾 <b>Payment proof received</b>',
    `Order: <b>${shortRef(order.id)}</b>`,
    `Buyer: ${ctx.from.username ? '@' + ctx.from.username : ctx.from.id}`,
    `Marketplace: ${order.marketplace}`,
    `Product: ${order.product_title ?? '(manual quote)'}`,
    `Link: ${order.product_url}`,
    `Amount: <b>${formatMoney(order.total_amount ?? 0, order.currency)}</b>`,
  ].join('\n');

  await notifyAdminsWithPhoto(bot.telegram, order, fileId, caption, approveRejectKeyboard(order.id));
}

export { shortRef };
