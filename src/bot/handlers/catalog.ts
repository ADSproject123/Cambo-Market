import type { Context } from 'telegraf';
import { config } from '../../lib/config';
import { syncCategory } from '../../lib/catalogSync';
import { createOrder } from '../../lib/db/orders';
import { getProduct, listCategories, listProducts } from '../../lib/db/products';
import { upsertUserFromCtx } from '../../lib/db/users';
import { formatCategoryName } from '../../lib/format';
import { formatMoney } from '../../lib/pricing';
import { detectMarketplace } from '../../lib/scrapers/index';
import { categoryMenuKeyboard, productDetailKeyboard, productListKeyboard } from '../keyboards';
import { presentPaymentQr } from './order';

export async function handleShowCategoryMenu(ctx: Context): Promise<void> {
  await upsertUserFromCtx(ctx);

  const categories = await listCategories();
  if (categories.length === 0) {
    await ctx.reply('No listings available right now — please check back shortly.');
    return;
  }

  await ctx.reply('🛒 <b>Shop by category</b>\nTap a category to browse:', {
    parse_mode: 'HTML',
    ...categoryMenuKeyboard(categories),
  });
}

const CATALOG_PAGE_SIZE = 10;

export async function handleShowCatalog(ctx: Context, category: string, page = 1): Promise<void> {
  await upsertUserFromCtx(ctx);

  let products = await listProducts({ category });
  if (products.length === 0) {
    // Nothing cached yet (e.g. first run before any /sync) — try one live fetch.
    // Only works for categories G2G can actually serve; manually-imported
    // (e.g. G2A) categories just fall through to the empty-state message.
    try {
      await syncCategory(category);
      products = await listProducts({ category });
    } catch {
      // fall through to the empty-state message below
    }
  }

  const label = formatCategoryName(category);

  if (products.length === 0) {
    await ctx.reply(`No ${label} listings available right now — please check back shortly.`);
    return;
  }

  const totalPages = Math.max(1, Math.ceil(products.length / CATALOG_PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const pageProducts = products.slice(
    (currentPage - 1) * CATALOG_PAGE_SIZE,
    currentPage * CATALOG_PAGE_SIZE,
  );
  const pageIndicator = totalPages > 1 ? `\nPage ${currentPage} of ${totalPages}` : '';

  await ctx.reply(`🛒 <b>${label}</b>${pageIndicator}\nTap a listing to see details and buy:`, {
    parse_mode: 'HTML',
    ...productListKeyboard(pageProducts, config.catalogMarkupUsd, category, currentPage, totalPages),
  });
}

export async function handleProductDetailCallback(ctx: Context): Promise<void> {
  const data = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : undefined;
  const parts = data?.split(':');
  const offerId = parts?.[1];
  if (!offerId) return;

  const pageRaw = Number(parts?.[2]);
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const product = await getProduct(offerId);
  if (!product) {
    await ctx.answerCbQuery('This listing is no longer available.');
    return;
  }

  await ctx.answerCbQuery();
  const total = product.base_price + config.catalogMarkupUsd;

  const lines = [
    `<b>${escapeHtml(product.title)}</b>`,
    `Price: <b>${formatMoney(total, product.currency)}</b>`,
    `Seller: ${escapeHtml(product.seller_username ?? 'unknown')}${product.seller_verified ? ' ✅' : ''}`,
  ];
  if (product.rating !== null) lines.push(`Rating: ${product.rating}★`);
  if (product.available_qty) lines.push(`Available: ${product.available_qty}`);

  await ctx.reply(lines.join('\n'), {
    parse_mode: 'HTML',
    ...productDetailKeyboard(product.offer_id, product.category, page),
  });
}

export async function handleProductBuyCallback(ctx: Context): Promise<void> {
  const data = ctx.callbackQuery && 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : undefined;
  const offerId = data?.split(':')[1];
  if (!offerId || !ctx.from) return;

  const product = await getProduct(offerId);
  if (!product) {
    await ctx.answerCbQuery('This listing is no longer available.');
    return;
  }

  await ctx.answerCbQuery();
  const total = product.base_price + config.catalogMarkupUsd;

  const order = await createOrder({
    telegramUserId: ctx.from.id,
    // Products can come from either marketplace now (catalog imports aren't
    // all scraped from G2G) — infer from the actual product URL rather than
    // assuming, so admin sees the right site when fulfilling.
    marketplace: detectMarketplace(product.url) ?? 'g2g',
    productUrl: product.url,
    productTitle: product.title,
    scrapedPrice: product.base_price,
    currency: product.currency,
    serviceFeePercent: 0,
    totalAmount: total,
    status: 'draft',
  });

  await presentPaymentQr(ctx, order);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
