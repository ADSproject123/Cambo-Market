// Run manually: `tsx scripts/g2a-scrape-search.ts <query> <category>`
// (or `npm run scrape:g2a:search -- <query> <category>`).
// Example: `npm run scrape:g2a:search -- gemini google-gemini`
//
// Authenticated G2A search scraping, using a saved login session (created by
// `npm run login:g2a`). Runs a search on g2a.com/search?query=<query> and
// saves every result into the shared `products` table under the given
// category — the same table/shape the plain-HTTP G2G scraper
// (src/lib/scrapers/g2gCatalog.ts) and the manual G2A imports use, so these
// show up on the storefront exactly like any other product.
//
// G2A's search-result cards don't show stock/availability at all (unlike
// G2G's offer pages) — available_qty is saved as 0 (this schema's existing
// "unknown/not shown" convention, same as every other manually-imported G2A
// product) rather than guessed.
//
// The DOM-walking extraction logic lives in the exported extractSearchResults
// function below — self-contained (no closures over anything outside
// itself), so it can be handed directly to `page.evaluate()`.

import { hasSavedSession, launchAuthenticatedContext } from '../src/lib/scrapers/playwright/session';
import { upsertScrapedProducts } from '../src/lib/db/products';
import type { G2GCatalogOffer } from '../src/lib/scrapers/g2gCatalog';

export interface SearchProduct {
  productId: string;
  title: string;
  url: string;
  price: number;
  currency: string;
  imageUrl: string | null;
}

/**
 * Extracts every product card from a G2A search-results page (e.g.
 * https://www.g2a.com/search?query=gemini). Meant to be run via
 * `page.evaluate(extractSearchResults)`.
 */
export function extractSearchResults(): SearchProduct[] {
  // Each card's outer wrapper carries a stable `data-product-id` attribute —
  // used instead of the surrounding styled-components classes (which have
  // build-specific hashed suffixes and aren't stable selectors).
  const cards = Array.from(document.querySelectorAll('[data-product-id]'));

  return cards.flatMap((card): SearchProduct[] => {
    const productId = card.getAttribute('data-product-id');
    const title = card.querySelector('h3')?.textContent?.trim();
    // data-unibox-anchor="true" is the card's own stable hook for its main
    // link, distinguishing it from other links inside the card (e.g. the
    // "sponsored" info dialog's "find out more" link).
    const href = card.querySelector('a[data-unibox-anchor="true"]')?.getAttribute('href');
    if (!productId || !title || !href) return [];

    const url = href.startsWith('http') ? href : `https://www.g2a.com${href}`;

    // Price: the price block's class includes "text-price" (a design-system
    // token, unlike the hashed styled-components classes elsewhere on this
    // page) — its leading text node is the amount, and the nested <span> is
    // the currency code (mirrors the same "leading text node" pattern used
    // for G2G's stock figure in g2g-scrape-google-accounts.ts).
    const priceEl = card.querySelector('[class*="text-price"]');
    const amountText = priceEl?.childNodes[0]?.textContent?.trim();
    const currency = priceEl?.querySelector('span')?.textContent?.trim();
    const price = amountText ? Number(amountText) : NaN;
    if (!Number.isFinite(price) || !currency) return [];

    const imageUrl = card.querySelector('img')?.getAttribute('src') ?? null;

    return [{ productId, title, url, price, currency, imageUrl }];
  });
}

async function main(): Promise<void> {
  const query = process.argv[2];
  const category = process.argv[3];

  if (!query || !category) {
    console.error('Usage: tsx scripts/g2a-scrape-search.ts <query> <category>');
    console.error('Example: tsx scripts/g2a-scrape-search.ts gemini google-gemini');
    process.exit(1);
  }

  if (!hasSavedSession('g2a')) {
    console.error('No saved G2A session found. Run `npm run login:g2a` first.');
    process.exit(1);
  }

  const { browser, context } = await launchAuthenticatedContext('g2a');
  try {
    const page = await context.newPage();
    const searchUrl = `https://www.g2a.com/search?query=${encodeURIComponent(query)}`;

    console.log(`Navigating to ${searchUrl}...`);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    const products = await page.evaluate(extractSearchResults);
    console.log(`Found ${products.length} product(s) for query "${query}".`);

    const offers: G2GCatalogOffer[] = products.map((p) => ({
      offerId: `g2a-${p.productId}`,
      title: p.title,
      price: p.price,
      currency: p.currency,
      // Not shown on a G2A search card — left blank, same as every other
      // manually-imported G2A product in this schema.
      sellerUsername: '',
      sellerVerified: false,
      rating: null,
      satisfactionRate: null,
      totalSuccessOrders: 0,
      availableQty: 0,
      url: p.url,
      imageUrl: p.imageUrl ?? undefined,
    }));

    await upsertScrapedProducts(category, offers);
    console.log(`Saved ${offers.length} product(s) to category "${category}".`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
