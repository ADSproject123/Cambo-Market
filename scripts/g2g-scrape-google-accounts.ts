// Run manually: `tsx scripts/g2g-scrape-google-accounts.ts`
// (or `npm run scrape:g2g`).
//
// Authenticated G2G scraping for the google-accounts category, using a saved
// login session (created by `npm run login:g2g`). Unlike the plain-HTTP
// scraper (src/lib/scrapers/g2gCatalog.ts), which only covers category
// listings, this drives a real logged-in browser so it can also reach an
// offer's detail page and read its overall stock and its "other sellers"
// list — data the plain scraper doesn't expose. See the README section
// "Authenticated G2G scraping".
//
// The DOM-walking extraction logic lives in the exported functions below
// (extractProductCards, extractStock, extractSellerOffers). Each is written
// as a self-contained function — no closures over anything outside itself —
// so it can be handed directly to `page.evaluate()` here, and equally reused
// by a separate test file driving `page.setContent()` + `page.evaluate()`
// against static sample HTML.

import { setTimeout as sleep } from 'node:timers/promises';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hasSavedSession, launchAuthenticatedContext } from '../src/lib/scrapers/playwright/session';

const CATEGORY_URL = 'https://www.g2g.com/categories/google-accounts';
const OUTPUT_PATH = path.join('output', 'g2g-google-accounts.json');
// Delay between offer detail-page visits — this is a real, authenticated
// account session, so being a reasonably well-behaved client matters more
// here than on the anonymous plain-HTTP scrapers.
const DETAIL_PAGE_DELAY_MS = 1500;

export interface ProductCard {
  title: string;
  detailUrl: string;
  fromPrice: number;
  currency: string;
}

export interface SellerOffer {
  sellerUsername: string;
  sellerLevel: number | null;
  satisfactionRate: number | null;
  totalSold: number | null;
  minQty: number | null;
  /** Kept as a string, like `stock` — can be a plain integer or an abbreviated figure like "986.4k". */
  availableQty: string | null;
  deliveryTime: string | null;
  price: number | null;
  currency: string | null;
}

export interface ProductResult {
  title: string;
  url: string;
  fromPrice: number;
  currency: string;
  /** Raw stock figure as shown on the page (e.g. "986.4k") — not parsed into a number. */
  stock: string | null;
  sellers: SellerOffer[];
}

/**
 * Extracts every product card from a G2G category page (e.g.
 * https://www.g2g.com/categories/google-accounts). Meant to be run via
 * `page.evaluate(extractProductCards)`.
 */
export function extractProductCards(): ProductCard[] {
  const cards = Array.from(document.querySelectorAll('[role="group"][aria-label="Product Card"]'));

  return cards.flatMap((card): ProductCard[] => {
    // The first `<a aria-label="View ...">` gives both the title and the
    // detail-page URL.
    const link = card.querySelector('a[aria-label^="View "]');
    const href = link?.getAttribute('href');
    const ariaLabel = link?.getAttribute('aria-label');
    if (!href || !ariaLabel) return [];

    const title = ariaLabel.replace(/^View /, '');

    // The "From" label is a leaf element whose trimmed text is exactly
    // "From"; its next sibling holds the amount + currency as two <span>s.
    const fromLabel = Array.from(card.querySelectorAll('*')).find(
      (el) => el.children.length === 0 && el.textContent?.trim() === 'From',
    );
    const priceSpans = fromLabel?.nextElementSibling
      ? Array.from(fromLabel.nextElementSibling.querySelectorAll('span'))
      : [];
    const amountText = priceSpans[0]?.textContent?.trim();
    const currency = priceSpans[1]?.textContent?.trim();
    const fromPrice = amountText ? Number(amountText) : NaN;

    if (!Number.isFinite(fromPrice) || !currency) return [];

    return [{ title, detailUrl: href, fromPrice, currency }];
  });
}

/**
 * Extracts the overall stock figure from a G2G offer detail page. Meant to
 * be run via `page.evaluate(extractStock)`.
 */
export function extractStock(): string | null {
  const availableLabel = Array.from(document.querySelectorAll('span')).find(
    (el) => el.textContent?.trim() === 'Available',
  );
  const container = availableLabel?.parentElement;
  if (!container) return null;

  // The stock figure is the parent's leading text node — NOT
  // parentElement.textContent, which would also include "Available" itself.
  const leading = container.childNodes[0]?.textContent?.trim();
  return leading || null;
}

/**
 * Extracts the "other sellers" list from a G2G offer detail page. Meant to
 * be run via `page.evaluate(extractSellerOffers)`.
 */
export function extractSellerOffers(): SellerOffer[] {
  const sellerLinks = Array.from(document.querySelectorAll('a.g-card-no-deco[href^="/"]'));

  return sellerLinks.flatMap((link): SellerOffer[] => {
    const row = link.closest('.border-subtle');
    const href = link.getAttribute('href');
    if (!row || !href) return [];

    const sellerUsername = href.replace(/^\//, '');
    const rowText = row.textContent ?? '';

    const levelMatch = rowText.match(/Lvl\s*(\d+)/);
    const sellerLevel = levelMatch ? Number(levelMatch[1]) : null;

    const successBadge = row.querySelector('.bg-success-badge');
    const satisfactionMatch = successBadge?.textContent?.match(/([\d.]+)%/);
    const satisfactionRate = satisfactionMatch ? Number(satisfactionMatch[1]) : null;

    const soldMatch = rowText.match(/(\d+)\s*sold/);
    const totalSold = soldMatch ? Number(soldMatch[1]) : null;

    // The three delivery badges, in document order. A "Volume discount"
    // chip can appear alongside them but lacks this class, so it's
    // naturally excluded. Fewer than 3 present -> leave the rest null.
    const deliveryBadges = Array.from(row.querySelectorAll('.q-badge__delivery'));
    const minQtyText = deliveryBadges[0]?.textContent?.trim();
    const parsedMinQty = minQtyText ? parseInt(minQtyText.replace(/^Min\.?\s*/i, ''), 10) : NaN;
    const minQty = Number.isFinite(parsedMinQty) ? parsedMinQty : null;
    const availableQty = deliveryBadges[1]?.textContent?.trim() || null;
    const deliveryTime = deliveryBadges[2]?.textContent?.trim() || null;

    // Price: the leaf element with trimmed textContent exactly "from"
    // (lowercase, unlike the category card's "From"), then its sibling
    // price/currency <span>s.
    const fromLabel = Array.from(row.querySelectorAll('*')).find(
      (el) => el.children.length === 0 && el.textContent?.trim() === 'from',
    );
    const priceSpan = fromLabel?.nextElementSibling;
    const currencySpan = priceSpan?.nextElementSibling;
    const priceText = priceSpan?.textContent?.trim();
    const parsedPrice = priceText ? Number(priceText) : NaN;
    const price = Number.isFinite(parsedPrice) ? parsedPrice : null;
    const currency = currencySpan?.textContent?.trim() || null;

    return [{
      sellerUsername,
      sellerLevel,
      satisfactionRate,
      totalSold,
      minQty,
      availableQty,
      deliveryTime,
      price,
      currency,
    }];
  });
}

export interface ScrapeSummary {
  results: ProductResult[];
  totalSellerOffers: number;
}

/**
 * The actual scrape, with no CLI-specific side effects (no console.log, no
 * writing OUTPUT_PATH, no process.exit) — reusable both by main() below and
 * by the admin API route (src/app/api/admin/scrape/g2g/route.ts), which runs
 * this in-process rather than shelling out to the CLI script.
 *
 * Throws if no saved session exists — caller decides how to surface that.
 */
export async function scrapeGoogleAccounts(): Promise<ScrapeSummary> {
  if (!hasSavedSession('g2g')) {
    throw new Error('No saved G2G session found. Run `npm run login:g2g` first.');
  }

  const { browser, context } = await launchAuthenticatedContext('g2g');
  try {
    const page = await context.newPage();

    await page.goto(CATEGORY_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    const cards = await page.evaluate(extractProductCards);

    const results: ProductResult[] = [];
    let totalSellerOffers = 0;

    for (const [index, card] of cards.entries()) {
      await page.goto(card.detailUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');

      const stock = await page.evaluate(extractStock);
      const sellers = await page.evaluate(extractSellerOffers);
      totalSellerOffers += sellers.length;

      results.push({
        title: card.title,
        url: card.detailUrl,
        fromPrice: card.fromPrice,
        currency: card.currency,
        stock,
        sellers,
      });

      if (index < cards.length - 1) {
        await sleep(DETAIL_PAGE_DELAY_MS);
      }
    }

    return { results, totalSellerOffers };
  } finally {
    await browser.close();
  }
}

async function main(): Promise<void> {
  console.log(`Navigating to ${CATEGORY_URL}...`);
  const { results, totalSellerOffers } = await scrapeGoogleAccounts();
  console.log(`Found ${results.length} product card(s).`);

  mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));

  console.log('');
  console.log(`Wrote ${results.length} product(s) with ${totalSellerOffers} total seller offer(s) to ${OUTPUT_PATH}`);
}

// Only run when executed directly (`tsx scripts/g2g-scrape-google-accounts.ts`),
// not when a test file imports the extraction functions above from this module.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
