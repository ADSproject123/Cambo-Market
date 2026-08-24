export type Marketplace = 'g2a' | 'g2g';

export interface ScrapedProduct {
  title: string;
  price: number;
  currency: string;
  imageUrl?: string;
  available?: boolean;
  /** True when the price came from a category/aggregate page rather than one specific listing (e.g. a lowPrice across many sellers) — treat as approximate. */
  isEstimate?: boolean;
}

export interface ScrapeResult {
  ok: boolean;
  product?: ScrapedProduct;
  error?: string;
}
