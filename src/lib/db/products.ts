import { createAdminClient } from '../supabase/admin';
import type { G2GCatalogOffer } from '../scrapers/g2gCatalog';

export interface ProductRow {
  offer_id: string;
  category: string;
  title: string;
  base_price: number;
  currency: string;
  seller_username: string | null;
  seller_verified: boolean;
  rating: number | null;
  satisfaction_rate: number | null;
  total_success_orders: number;
  available_qty: number;
  url: string;
  image_url: string | null;
  /** Rows sharing the same variant_group are price tiers of the same underlying item (see schema_variants.sql). Null = standalone product. */
  variant_group: string | null;
  /** Tier label shown to the buyer, e.g. "1 Month" — only meaningful when variant_group is set. */
  variant_label: string | null;
  last_synced_at: string;
  created_at: string;
}

export interface ListProductsOptions {
  category?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
}

export async function listProducts(options: ListProductsOptions = {}): Promise<ProductRow[]> {
  const db = createAdminClient();
  let query = db.from('products').select().order('category').order('base_price', { ascending: true });
  
  if (options.category) query = query.eq('category', options.category);
  if (options.searchQuery) query = query.ilike('title', `%${options.searchQuery}%`);
  if (options.minPrice !== undefined) query = query.gte('base_price', options.minPrice);
  if (options.maxPrice !== undefined) query = query.lte('base_price', options.maxPrice);
  if (options.verifiedOnly) query = query.eq('seller_verified', true);
  
  const { data, error } = await query;
  if (error) throw error;
  return (data as ProductRow[]) ?? [];
}

import { getLogoForCategory } from '../logos';

export interface CategorySummary {
  category: string;
  count: number;
  cheapestPrice: number;
  currency: string;
  imageUrl: string | null;
}

/** Distinct categories currently stocked, cheapest-price-first within each, for the storefront landing page. */
export async function listCategories(options?: ListProductsOptions): Promise<CategorySummary[]> {
  const products = await listProducts(options);
  const byCategory = new Map<string, ProductRow[]>();

  for (const p of products) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  }

  return Array.from(byCategory.entries()).map(([category, items]) => {
    const cheapest = items.reduce((a, b) => (b.base_price < a.base_price ? b : a));
    return {
      category,
      count: items.length,
      cheapestPrice: cheapest.base_price,
      currency: cheapest.currency,
      imageUrl: getLogoForCategory(category, items[0].title) || items.find((p) => p.image_url)?.image_url || null,
    };
  });
}

export async function getProduct(offerId: string): Promise<ProductRow | null> {
  const db = createAdminClient();
  const { data, error } = await db.from('products').select().eq('offer_id', offerId).maybeSingle();
  if (error) throw error;
  return data as ProductRow | null;
}

/**
 * All price tiers for the product at `offerId`: if it has a variant_group,
 * every row sharing that group (cheapest first); otherwise just itself.
 * This is what the product detail page renders as the tier selector.
 */
export async function getProductVariants(offerId: string): Promise<ProductRow[]> {
  const product = await getProduct(offerId);
  if (!product) return [];
  if (!product.variant_group) {
    product.image_url = getLogoForCategory(product.category, product.title) || product.image_url;
    return [product];
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from('products')
    .select()
    .eq('variant_group', product.variant_group)
    .order('base_price', { ascending: true });
  if (error) throw error;
  
  const products = (data as ProductRow[]) ?? [product];
  return products.map(p => ({
    ...p,
    image_url: getLogoForCategory(p.category, p.title) || p.image_url
  }));
}

export async function upsertScrapedProducts(category: string, offers: G2GCatalogOffer[]): Promise<void> {
  if (offers.length === 0) return;
  const db = createAdminClient();

  const rows = offers.map((o) => ({
    offer_id: o.offerId,
    category,
    title: o.title,
    base_price: o.price,
    currency: o.currency,
    seller_username: o.sellerUsername,
    seller_verified: o.sellerVerified,
    rating: o.rating,
    satisfaction_rate: o.satisfactionRate,
    total_success_orders: o.totalSuccessOrders,
    available_qty: o.availableQty,
    url: o.url,
    image_url: o.imageUrl ?? null,
    last_synced_at: new Date().toISOString(),
  }));

  const { error } = await db.from('products').upsert(rows, { onConflict: 'offer_id' });
  if (error) throw error;
}

export interface ManualProductInput {
  offerId?: string;
  category: string;
  title: string;
  basePrice: number;
  currency: string;
  url: string;
  imageUrl?: string | null;
  variantGroup?: string | null;
  variantLabel?: string | null;
}

/** Admin-created/edited listing — not tied to a scraped G2G offer_id unless one is supplied. Also used to tag an existing (incl. scraped) row into a variant_group. */
export async function upsertManualProduct(input: ManualProductInput): Promise<ProductRow> {
  const db = createAdminClient();
  const offerId = input.offerId ?? `manual-${crypto.randomUUID()}`;

  const row: Record<string, unknown> = {
    offer_id: offerId,
    category: input.category,
    title: input.title,
    base_price: input.basePrice,
    currency: input.currency,
    url: input.url,
    image_url: input.imageUrl ?? null,
    last_synced_at: new Date().toISOString(),
  };
  // Only reference these columns when actually used, so this keeps working
  // on a database that hasn't run schema_variants.sql yet.
  if (input.variantGroup) row.variant_group = input.variantGroup;
  if (input.variantLabel) row.variant_label = input.variantLabel;

  const { data, error } = await db.from('products').upsert(row, { onConflict: 'offer_id' }).select().single();

  if (error) throw error;
  return data as ProductRow;
}

export async function deleteProduct(offerId: string): Promise<void> {
  const db = createAdminClient();
  const { error } = await db.from('products').delete().eq('offer_id', offerId);
  if (error) throw error;
}

export async function deleteProducts(offerIds: string[]): Promise<void> {
  if (offerIds.length === 0) return;
  const db = createAdminClient();
  const { error } = await db.from('products').delete().in('offer_id', offerIds);
  if (error) throw error;
}

/** Distinct category names currently in use, for the admin filter dropdown. */
export async function listDistinctCategories(): Promise<string[]> {
  const db = createAdminClient();
  const { data, error } = await db.from('products').select('category').order('category');
  if (error) throw error;
  return Array.from(new Set((data ?? []).map((r) => r.category as string)));
}
