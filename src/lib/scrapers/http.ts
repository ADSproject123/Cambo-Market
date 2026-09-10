import { fetch, ProxyAgent, type Dispatcher } from 'undici';
import * as cheerio from 'cheerio';
import { config } from '../config';

const DESKTOP_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const proxyAgent = config.scraperProxyUrl ? new ProxyAgent(config.scraperProxyUrl) : undefined;

/**
 * Plain HTTP GET with browser-like headers. This intentionally does NOT use a
 * headless browser: testing showed both G2A and G2G's bot protection (Akamai)
 * blocks headless Chromium harder than a plain HTTP client on these hosts.
 */
export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'user-agent': DESKTOP_USER_AGENT,
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9',
    },
    dispatcher: proxyAgent as Dispatcher | undefined,
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }

  return res.text();
}

interface JsonLdOffer {
  '@type'?: string;
  price?: number | string;
  lowPrice?: number | string;
  priceCurrency?: string;
  availability?: string;
}

interface JsonLdProduct {
  '@type'?: string;
  name?: string;
  image?: string | string[];
  offers?: JsonLdOffer | JsonLdOffer[];
}

/** Extract schema.org Product data from any <script type="application/ld+json"> block. */
export function extractJsonLdProduct(html: string): JsonLdProduct | null {
  const $ = cheerio.load(html);
  const blocks = $('script[type="application/ld+json"]');

  for (const el of blocks.toArray()) {
    const raw = $(el).contents().text();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const candidate of candidates) {
        const type = candidate?.['@type'];
        if (type === 'Product' || (Array.isArray(type) && type.includes('Product'))) {
          return candidate as JsonLdProduct;
        }
      }
    } catch {
      // ignore malformed JSON-LD blocks
    }
  }
  return null;
}

/** Cheap universal fallback: Open Graph / product meta tags used for link previews. */
export function extractMetaProduct(html: string): { title?: string; price?: number; currency?: string; image?: string } {
  const $ = cheerio.load(html);
  const meta = (name: string) =>
    $(`meta[property="${name}"]`).attr('content') ?? $(`meta[name="${name}"]`).attr('content');

  const title = meta('og:title') ?? $('title').first().text() ?? undefined;
  const image = meta('og:image') ?? undefined;
  const priceRaw = meta('product:price:amount') ?? meta('og:price:amount') ?? undefined;
  const currency = meta('product:price:currency') ?? meta('og:price:currency') ?? undefined;
  const price = priceRaw ? Number(priceRaw) : undefined;

  return { title, price: Number.isFinite(price) ? price : undefined, currency, image };
}

export function priceFromJsonLd(
  product: JsonLdProduct,
): { price: number; currency: string; isEstimate: boolean } | null {
  const offers = Array.isArray(product.offers) ? product.offers[0] : product.offers;
  if (!offers) return null;

  const rawPrice = offers.price ?? offers.lowPrice;
  const price = typeof rawPrice === 'string' ? Number(rawPrice) : rawPrice;
  if (!price || !Number.isFinite(price)) return null;

  const isEstimate = offers['@type'] === 'AggregateOffer' || offers.lowPrice !== undefined;

  return { price, currency: offers.priceCurrency || 'USD', isEstimate };
}
