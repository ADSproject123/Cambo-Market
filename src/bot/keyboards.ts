import { Markup } from 'telegraf';
import type { CategorySummary, ProductRow } from '../lib/db/products';
import { formatCategoryName } from '../lib/format';

export const categoryMenuKeyboard = (categories: CategorySummary[]) =>
  Markup.inlineKeyboard(
    categories.map((c) => [
      Markup.button.callback(`${formatCategoryName(c.category)} (${c.count})`, `catalog:${c.category}`),
    ]),
  );

export const productListKeyboard = (
  products: ProductRow[],
  markupUsd: number,
  category: string,
  page: number,
  totalPages: number,
) => {
  const navRow = [
    ...(page > 1 ? [Markup.button.callback('◀ Prev', `catalog:${category}:${page - 1}`)] : []),
    ...(page < totalPages ? [Markup.button.callback('Next ▶', `catalog:${category}:${page + 1}`)] : []),
  ];

  return Markup.inlineKeyboard([
    ...products.map((p) => [
      Markup.button.callback(
        `${truncate(p.title, 45)} — $${(p.base_price + markupUsd).toFixed(2)}`,
        `product:${p.offer_id}:${page}`,
      ),
    ]),
    ...(navRow.length > 0 ? [navRow] : []),
    [Markup.button.callback('« All categories', 'catalog_menu')],
  ]);
};

export const productDetailKeyboard = (offerId: string, category: string, page = 1) =>
  Markup.inlineKeyboard([
    Markup.button.callback('✅ Buy', `product_buy:${offerId}`),
    Markup.button.callback('« Back to list', `catalog:${category}:${page}`),
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
