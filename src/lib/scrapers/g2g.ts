import { extractJsonLdProduct, extractMetaProduct, fetchHtml, priceFromJsonLd } from './http.js';
import type { ScrapeResult } from './types.js';

/**
 * G2G server-renders most pages, so plain HTTP fetch works where a headless
 * browser gets blocked (Akamai flags headless Chromium here even when it
 * lets a plain GET through). A single offer URL (…/offer/<id>) carries its
 * own JSON-LD Product+Offer for SEO; a category/listing URL only carries an
 * AggregateOffer (price range across many sellers), which we mark as an
 * estimate rather than a firm quote.
 */
export async function scrapeG2G(url: string): Promise<ScrapeResult> {
  try {
    const html = await fetchHtml(url);
    const isOfferPage = /\/offer\//.test(new URL(url).pathname);

    const jsonLd = extractJsonLdProduct(html);
    if (jsonLd?.name) {
      const priced = priceFromJsonLd(jsonLd);
      if (priced) {
        return {
          ok: true,
          product: {
            title: jsonLd.name,
            price: priced.price,
            currency: priced.currency,
            imageUrl: Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image,
            isEstimate: priced.isEstimate || !isOfferPage,
          },
        };
      }
    }

    const meta = extractMetaProduct(html);
    if (meta.title && meta.price) {
      return {
        ok: true,
        product: {
          title: meta.title,
          price: meta.price,
          currency: meta.currency || 'USD',
          imageUrl: meta.image,
          isEstimate: !isOfferPage,
        },
      };
    }

    return {
      ok: false,
      error: isOfferPage
        ? 'Could not find product/price data on the page.'
        : 'This looks like a category/search page, not a single listing — paste a specific offer link instead.',
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
