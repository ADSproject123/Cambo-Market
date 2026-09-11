'use client';

import { useState } from 'react';

export default function G2GAuthScrapeButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleScrape() {
    setLoading(true);
    setMessage(null);

    const res = await fetch('/api/admin/scrape/g2g', { method: 'POST' });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(`❌ ${data.error ?? 'Scrape failed.'}`);
      return;
    }
    setMessage(`✅ Scraped ${data.products} product(s), ${data.sellerOffers} seller offer(s) — see output/g2g-google-accounts.json.`);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleScrape}
          disabled={loading}
          className="rounded-full border border-black px-4 py-1.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
        >
          {loading ? 'Scraping (this opens a real browser)…' : '🕵️ Run authenticated G2G scrape'}
        </button>
        {message && <span className="text-sm text-neutral-600">{message}</span>}
      </div>
      <p className="text-xs text-neutral-500">
        Requires <code>npm run login:g2g</code> to have been run on this machine first, and only
        makes sense run locally — it opens a real browser here and writes to a local file, not to
        the product catalog. See README &quot;Authenticated G2G scraping&quot;.
      </p>
    </div>
  );
}
