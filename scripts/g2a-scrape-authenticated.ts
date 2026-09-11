// Run manually: `tsx scripts/g2a-scrape-authenticated.ts <url>`
// (or `npm run scrape:g2a -- <url>`).
//
// Template for prototyping authenticated G2A scraping against a saved login
// session (created by `npm run login:g2a`). This opens the given URL in a
// real, logged-in browser and leaves you a spot to write the actual
// extraction logic once you can see the real page — see the TODO section
// below. Must be run from a network G2A doesn't block (see README).

import { hasSavedSession, launchAuthenticatedContext } from '../src/lib/scrapers/playwright/session';
// Referenced only in the comment in the TODO section below, as a shape to
// aim for once you have real extraction logic — not required while
// prototyping.
import type { ScrapedProduct } from '../src/lib/scrapers/types';

async function main(): Promise<void> {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: tsx scripts/g2a-scrape-authenticated.ts <url>');
    process.exit(1);
  }

  if (!hasSavedSession('g2a')) {
    console.error('No saved G2A session found. Run `npm run login:g2a` first.');
    process.exit(1);
  }

  const { browser, context } = await launchAuthenticatedContext('g2a');
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');

  // ===== TODO(user): write your scraping logic below =====
  //
  // Illustrative, UNTESTED example of the KIND of thing that goes here — not
  // real working extraction logic. g2a.com is unreachable from this
  // environment, so these exact selectors have not been checked against a
  // real product page:
  //
  //   const title = await page.locator('h1').first().textContent();
  //   const priceText = await page.locator('[data-testid="price"]').first().textContent();
  //   const price = priceText ? Number(priceText.replace(/[^0-9.]/g, '')) : undefined;
  //
  // Once this works, consider shaping your result like the existing
  // ScrapedProduct type (src/lib/scrapers/types.ts) — { title, price,
  // currency, imageUrl?, available?, isEstimate? } — so it could later plug
  // into scrapeProduct() in src/lib/scrapers/index.ts if you want to. Not
  // required for now — freeform is fine while you're prototyping.
  //
  // ===== end TODO =====

  console.log('Scraped:', /* the data you extracted above */ undefined);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
