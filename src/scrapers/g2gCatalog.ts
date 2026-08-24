import { parse as devalueParse } from 'devalue';
import { fetch, ProxyAgent, type Dispatcher } from 'undici';
import { config } from '../config.js';

const DESKTOP_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const proxyAgent = config.scraperProxyUrl ? new ProxyAgent(config.scraperProxyUrl) : undefined;

export interface G2GCatalogOffer {
  offerId: string;
  title: string;
  price: number;
  currency: string;
  sellerUsername: string;
  sellerVerified: boolean;
  rating: number | null;
  satisfactionRate: number | null;
  totalSuccessOrders: number;
  availableQty: number;
  url: string;
  imageUrl?: string;
}

interface RawOffer {
  offer_id: string;
  title: string;
  display_price: string;
  display_currency: string;
  username: string;
  verified_seller?: string;
  total_rating?: number;
  satisfaction_rate?: number;
  total_success_order?: number;
  available_qty?: number;
  precheckout_url: string;
  user_avatar?: string;
  offer_media_files?: { url?: string }[];
}

interface CategoryPageData {
  offers?: RawOffer[];
  totalResults?: number;
  maxPage?: number;
}

/**
 * SvelteKit (which powers g2g.com) exposes a `<route>/__data.json` endpoint
 * for client-side navigation — it returns the exact same per-listing data
 * the page renders (price, seller, rating, direct offer URL), serialized
 * with `devalue`. Confirmed by testing: reachable via a plain HTTP GET, no
 * cookies or headless browser required, unlike the category page itself
 * (whose SSR HTML only contains an aggregate price range, not the individual
 * listings).
 */
async function fetchCategoryPage(categorySlug: string, page: number): Promise<CategoryPageData | null> {
  const url = `https://www.g2g.com/categories/${categorySlug}/__data.json${page > 1 ? `?page=${page}` : ''}`;
  const res = await fetch(url, {
    headers: {
      'user-agent': DESKTOP_USER_AGENT,
      accept: 'application/json',
    },
    dispatcher: proxyAgent as Dispatcher | undefined,
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }

  const json = (await res.json()) as { nodes?: { type?: string; data?: unknown }[] };

  for (const node of json.nodes ?? []) {
    if (node?.type !== 'data' || node.data === undefined) continue;
    try {
      const decoded = devalueParse(JSON.stringify(node.data)) as CategoryPageData;
      if (decoded && Array.isArray(decoded.offers)) return decoded;
    } catch {
      // this node wasn't the offer-listing data — keep looking
    }
  }
  return null;
}

function mapOffer(raw: RawOffer): G2GCatalogOffer {
  return {
    offerId: raw.offer_id,
    title: raw.title,
    price: Number(raw.display_price),
    currency: raw.display_currency || 'USD',
    sellerUsername: raw.username,
    sellerVerified: raw.verified_seller === 'verified',
    rating: raw.total_rating ?? null,
    satisfactionRate: raw.satisfaction_rate ?? null,
    totalSuccessOrders: raw.total_success_order ?? 0,
    availableQty: raw.available_qty ?? 0,
    url: raw.precheckout_url,
    imageUrl: raw.offer_media_files?.[0]?.url || raw.user_avatar,
  };
}

/** Fetches every offer listed under a G2G category, walking pagination until exhausted. */
export async function fetchG2GCategoryOffers(categorySlug: string): Promise<G2GCatalogOffer[]> {
  const all: G2GCatalogOffer[] = [];
  let page = 1;

  while (true) {
    const data = await fetchCategoryPage(categorySlug, page);
    if (!data?.offers?.length) break;

    all.push(...data.offers.filter((o) => Number(o.display_price) > 0).map(mapOffer));

    const maxPage = data.maxPage ?? 1;
    if (page >= maxPage) break;
    page++;
  }

  return all;
}
