import { upsertProducts } from './db/products.js';
import { fetchG2GCategoryOffers } from './scrapers/g2gCatalog.js';
import { logger } from './logger.js';

/** Categories the bot currently sells from. Add more slugs here as coverage grows. */
export const CATALOG_CATEGORIES = ['google-accounts'] as const;

export async function syncCategory(category: string): Promise<number> {
  const offers = await fetchG2GCategoryOffers(category);
  await upsertProducts(category, offers);
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
