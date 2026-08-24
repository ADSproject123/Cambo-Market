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
  last_synced_at: string;
  created_at: string;
}

export async function listProducts(category?: string): Promise<ProductRow[]> {
  const db = createAdminClient();
  let query = db.from('products').select().order('category').order('base_price', { ascending: true });
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return (data as ProductRow[]) ?? [];
}

export async function getProduct(offerId: string): Promise<ProductRow | null> {
  const db = createAdminClient();
  const { data, error } = await db.from('products').select().eq('offer_id', offerId).maybeSingle();
  if (error) throw error;
  return data as ProductRow | null;
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
}

/** Admin-created/edited listing — not tied to a scraped G2G offer_id unless one is supplied. */
export async function upsertManualProduct(input: ManualProductInput): Promise<ProductRow> {
  const db = createAdminClient();
  const offerId = input.offerId ?? `manual-${crypto.randomUUID()}`;

  const { data, error } = await db
    .from('products')
    .upsert(
      {
        offer_id: offerId,
        category: input.category,
        title: input.title,
        base_price: input.basePrice,
        currency: input.currency,
        url: input.url,
        image_url: input.imageUrl ?? null,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: 'offer_id' },
    )
    .select()
    .single();

  if (error) throw error;
  return data as ProductRow;
}

export async function deleteProduct(offerId: string): Promise<void> {
  const db = createAdminClient();
  const { error } = await db.from('products').delete().eq('offer_id', offerId);
  if (error) throw error;
}
