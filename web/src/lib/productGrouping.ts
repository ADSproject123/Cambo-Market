import type { ProductRow } from './db/products';

export interface ProductGroup {
  /** offer_id of the cheapest variant — what the card links to (/products/[offerId]). */
  representativeOfferId: string;
  title: string;
  cheapestPrice: number;
  currency: string;
  variantCount: number;
  imageUrl: string | null;
  sellerUsername: string | null;
  sellerVerified: boolean;
  rating: number | null;
}

/** Collapses rows sharing a variant_group into one card (cheapest-tier-first); ungrouped rows are their own single-item group. */
export function groupProductsForDisplay(products: ProductRow[]): ProductGroup[] {
  const groups = new Map<string, ProductRow[]>();

  for (const p of products) {
    const key = p.variant_group || `single:${p.offer_id}`;
    const list = groups.get(key) ?? [];
    list.push(p);
    groups.set(key, list);
  }

  return Array.from(groups.values())
    .map((items) => {
      const cheapest = items.reduce((a, b) => (b.base_price < a.base_price ? b : a));
      return {
        representativeOfferId: cheapest.offer_id,
        title: cheapest.title,
        cheapestPrice: cheapest.base_price,
        currency: cheapest.currency,
        variantCount: items.length,
        imageUrl: items.find((p) => p.image_url)?.image_url ?? null,
        sellerUsername: cheapest.seller_username,
        sellerVerified: cheapest.seller_verified,
        rating: cheapest.rating,
      };
    })
    .sort((a, b) => a.cheapestPrice - b.cheapestPrice);
}
