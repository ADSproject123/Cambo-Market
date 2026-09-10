import { extractJsonLdProduct, extractMetaProduct, fetchHtml, priceFromJsonLd } from './http';
import type { ScrapeResult } from './types';

/**
 * G2A blocks essentially all traffic from datacenter/VPS IPs at the edge
 * (Akamai) — confirmed in testing, where even a plain HTTP GET to the
 * homepage returned 403. Without SCRAPER_PROXY_URL pointing at a residential
 * proxy, this will almost always fail; it fails cleanly (ok: false) so the
 * bot can fall back to an admin manually quoting the price.
 */
export async function scrapeG2A(url: string): Promise<ScrapeResult> {
  try {
    const html = await fetchHtml(url);

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
            isEstimate: priced.isEstimate,
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
        },
      };
    }

    return { ok: false, error: 'Could not find product/price data on the page.' };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
