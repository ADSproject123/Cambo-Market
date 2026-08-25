import { supabase } from './supabase.js';
import type { G2GCatalogOffer } from '../scrapers/g2gCatalog.js';

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
  last_synced_at: string;
  created_at: string;
}

export async function upsertProducts(category: string, offers: G2GCatalogOffer[]): Promise<void> {
  if (offers.length === 0) return;

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

  const { error } = await supabase.from('products').upsert(rows, { onConflict: 'offer_id' });
  if (error) throw error;
}

export async function listProductsByCategory(category: string): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from('products')
    .select()
    .eq('category', category)
    .order('base_price', { ascending: true });

  if (error) throw error;
  return (data as ProductRow[]) ?? [];
}

export async function getProduct(offerId: string): Promise<ProductRow | null> {
  const { data, error } = await supabase.from('products').select().eq('offer_id', offerId).maybeSingle();
  if (error) throw error;
  return data as ProductRow | null;
}

export interface CategorySummary {
  category: string;
  count: number;
  cheapestPrice: number;
  currency: string;
}

/** Distinct categories currently stocked, for the /start browsing menu — source-agnostic, includes manually-imported (e.g. G2A) categories too. */
export async function listCategories(): Promise<CategorySummary[]> {
  const { data, error } = await supabase.from('products').select('category, base_price, currency');
  if (error) throw error;

  const byCategory = new Map<string, { count: number; cheapestPrice: number; currency: string }>();
  for (const row of (data as { category: string; base_price: number; currency: string }[]) ?? []) {
    const existing = byCategory.get(row.category);
    if (!existing || row.base_price < existing.cheapestPrice) {
      byCategory.set(row.category, {
        count: (existing?.count ?? 0) + 1,
        cheapestPrice: row.base_price,
        currency: row.currency,
      });
    } else {
      existing.count += 1;
    }
  }

  return Array.from(byCategory.entries()).map(([category, v]) => ({ category, ...v }));
}
