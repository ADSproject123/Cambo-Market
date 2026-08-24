import { Markup } from 'telegraf';

export const buyOrCancelKeyboard = (orderId: string) =>
  Markup.inlineKeyboard([
    Markup.button.callback('✅ Buy', `buy:${orderId}`),
    Markup.button.callback('✖️ Cancel', `cancel:${orderId}`),
  ]);

export const cancelOnlyKeyboard = (orderId: string) =>
  Markup.inlineKeyboard([Markup.button.callback('✖️ Cancel', `cancel:${orderId}`)]);

export const approveRejectKeyboard = (orderId: string) =>
  Markup.inlineKeyboard([
    Markup.button.callback('✅ Approve payment', `approve:${orderId}`),
    Markup.button.callback('❌ Reject payment', `reject:${orderId}`),
  ]);
