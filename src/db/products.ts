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
