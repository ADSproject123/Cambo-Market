import { scrapeG2A } from './g2a';
import { scrapeG2G } from './g2g';
import type { Marketplace, ScrapeResult } from './types';

export type { Marketplace, ScrapeResult, ScrapedProduct } from './types';

export function detectMarketplace(url: string): Marketplace | null {
  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }

  if (host === 'g2a.com' || host.endsWith('.g2a.com')) return 'g2a';
  if (host === 'g2g.com' || host.endsWith('.g2g.com')) return 'g2g';
  return null;
}

export async function scrapeProduct(url: string, marketplace: Marketplace): Promise<ScrapeResult> {
  return marketplace === 'g2a' ? scrapeG2A(url) : scrapeG2G(url);
}
