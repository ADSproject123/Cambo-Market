import { Markup } from 'telegraf';
import type { ProductRow } from '../db/products.js';

export const productListKeyboard = (products: ProductRow[], markupUsd: number) =>
  Markup.inlineKeyboard(
    products.map((p) => [
      Markup.button.callback(
        `${truncate(p.title, 45)} — $${(p.base_price + markupUsd).toFixed(2)}`,
        `product:${p.offer_id}`,
      ),
    ]),
  );

export const productDetailKeyboard = (offerId: string) =>
  Markup.inlineKeyboard([
    Markup.button.callback('✅ Buy', `product_buy:${offerId}`),
    Markup.button.callback('« Back to list', 'catalog:google-accounts'),
  ]);

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

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
