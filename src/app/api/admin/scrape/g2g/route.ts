import { NextResponse } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth';
import { scrapeGoogleAccounts } from '@scripts/g2g-scrape-google-accounts';

/**
 * Runs the authenticated Playwright scrape in-process (not a subprocess),
 * reusing the exact same exported function the CLI script (`npm run
 * scrape:g2g`) calls. This requires a session already saved via
 * `npm run login:g2g` on THIS machine — there's no way to complete a login
 * (2FA/CAPTCHA) from a web request, and it launches a real, visible browser,
 * so this only makes sense run locally (`npm run dev`), not on a deployed
 * server, which is also the exact kind of IP that's blocked in the first
 * place (see README "Authenticated G2G scraping").
 */
export async function POST() {
  try {
    await requireRole('admin');
    const { results, totalSellerOffers } = await scrapeGoogleAccounts();

    return NextResponse.json({
      products: results.length,
      sellerOffers: totalSellerOffers,
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
