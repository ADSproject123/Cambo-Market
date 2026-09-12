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

    // Refuse outright on Vercel (or any host setting this): launching a
    // real, visible Chromium here would fail anyway (no browser binary
    // downloaded, no display), and this server's IP is the exact kind
    // that's blocked by G2G in the first place. Vercel sets VERCEL=1 on
    // every deployment automatically.
    if (process.env.VERCEL) {
      return NextResponse.json(
        { error: 'Authenticated G2G scraping only runs locally (npm run dev) — not on a deployed server. See README "Authenticated G2G scraping".' },
        { status: 501 },
      );
    }

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
