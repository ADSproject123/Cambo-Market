import type { Context, Telegraf } from 'telegraf';
import { findOrderByAdminMessage, getOrder, updateOrder } from '../../lib/db/orders.js';
import { applyServiceFee, formatMoney } from '../../lib/pricing.js';
import { isAdminContext } from '../auth.js';
import { buyOrCancelKeyboard } from '../keyboards.js';
import { shortRef } from './order.js';

export async function handleApproveCallback(ctx: Context): Promise<void> {
  if (!isAdminContext(ctx)) {
    await ctx.answerCbQuery('Admins only.');
    return;
  }

  const data = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : undefined;
  const orderId = data?.split(':')[1];
  if (!orderId) return;

  const order = await getOrder(orderId);
  if (!order || order.status !== 'pending_review') {
    await ctx.answerCbQuery('This order is no longer pending review.');
    return;
  }

  await updateOrder(order.id, { status: 'approved' });
  await ctx.answerCbQuery('Approved.');
  await ctx.reply(
    `✅ Order ${shortRef(order.id)} approved. Go buy it on ${order.marketplace}, then reply to the order photo above with the key/account details to deliver it to the buyer.`,
  );

  await ctx.telegram.sendMessage(
    order.telegram_user_id!,
    `✅ Payment confirmed for order ${shortRef(order.id)}! We're purchasing your item now — you'll receive it here shortly.`,
  );
}

export async function handleRejectCallback(ctx: Context): Promise<void> {
  if (!isAdminContext(ctx)) {
    await ctx.answerCbQuery('Admins only.');
    return;
  }

  const data = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : undefined;
  const orderId = data?.split(':')[1];
  if (!orderId) return;

  const order = await getOrder(orderId);
  if (!order || order.status !== 'pending_review') {
    await ctx.answerCbQuery('This order is no longer pending review.');
    return;
  }

  await updateOrder(order.id, { status: 'rejected' });
  await ctx.answerCbQuery('Rejected.');
  await ctx.reply(`❌ Order ${shortRef(order.id)} rejected.`);

  await ctx.telegram.sendMessage(
    order.telegram_user_id!,
    `❌ We couldn't verify your payment for order ${shortRef(order.id)}. Please contact support or send a clearer screenshot.`,
  );
}

/** Handles a plain-text reply (in an admin chat) to a previously forwarded order message. */
export async function handleAdminReply(ctx: Context, _bot: Telegraf): Promise<void> {
  if (!isAdminContext(ctx)) return;

  const message = ctx.message;
  if (!message || !('reply_to_message' in message) || !message.reply_to_message || !('text' in message)) return;

  const order = await findOrderByAdminMessage(ctx.chat!.id, message.reply_to_message.message_id);
  if (!order) return;

  const replyText = message.text.trim();

  if (order.status === 'needs_quote') {
    const price = Number(replyText.replace(/[^0-9.]/g, ''));
    if (!price || !Number.isFinite(price)) {
      await ctx.reply('Reply with just a number for the price, e.g. 24.99');
      return;
    }

    const total = applyServiceFee(price, order.service_fee_percent);
    await updateOrder(order.id, { scraped_price: price, total_amount: total, status: 'draft' });
    await ctx.reply(`Quoted ${formatMoney(total, order.currency)} to the buyer for order ${shortRef(order.id)}.`);

    await ctx.telegram.sendMessage(
      order.telegram_user_id!,
      [
        `💬 An admin quoted a price for your order ${shortRef(order.id)}:`,
        `Total to pay (incl. service fee): <b>${formatMoney(total, order.currency)}</b>`,
      ].join('\n'),
      { parse_mode: 'HTML', ...buyOrCancelKeyboard(order.id) },
    );
    return;
  }

  if (order.status === 'approved') {
    await updateOrder(order.id, { delivered_content: replyText, status: 'fulfilled' });
    await ctx.reply(`Delivered to buyer for order ${shortRef(order.id)}. ✅`);

    await ctx.telegram.sendMessage(
      order.telegram_user_id!,
      [`🎁 Order ${shortRef(order.id)} fulfilled! Here's your item:`, '', replyText].join('\n'),
    );
    return;
  }

  await ctx.reply(`No action expected for order ${shortRef(order.id)} right now (status: ${order.status}).`);
}
