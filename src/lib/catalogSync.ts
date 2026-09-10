import { upsertScrapedProducts } from './db/products';
import { fetchG2GCategoryOffers } from './scrapers/g2gCatalog';
import { logger } from './logger';

/**
 * G2G category slugs this bot can auto-refresh via /sync (no args) and on
 * startup. This is NOT the full list of sellable categories — categories
 * populated manually (e.g. from G2A, which can't be scraped from here) also
 * show up in the browsing menu via listCategories(), they just aren't
 * re-fetchable automatically. Use `/sync <slug>` to pull in another G2G
 * category on demand without a code change.
 */
export const CATALOG_CATEGORIES = ['google-accounts', 'cnva-accounts'] as const;

export async function syncCategory(category: string): Promise<number> {
  const offers = await fetchG2GCategoryOffers(category);
  await upsertScrapedProducts(category, offers);
  logger.info(`Synced ${offers.length} offers for category "${category}"`);
  return offers.length;
}

export async function syncAllCategories(): Promise<void> {
  for (const category of CATALOG_CATEGORIES) {
    try {
      await syncCategory(category);
    } catch (err) {
      logger.error(`Failed to sync category "${category}"`, err);
    }
  }
}
