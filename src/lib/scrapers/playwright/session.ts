import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium, type Browser, type BrowserContext } from 'playwright';

/**
 * Shared Playwright helpers for authenticated scraping, across multiple
 * sites (currently G2A and G2G — see the `Site` type below).
 *
 * This is a separate capability from the plain-HTTP scrapers (`../g2a.ts`,
 * `../g2g.ts`, `../g2gCatalog.ts`): G2A is IP-blocked outright from most
 * server IPs (see http.ts), and G2G's plain-HTTP scraper doesn't expose
 * per-seller detail-page data — so this path instead drives a real, visible
 * browser logged into a real account on the target site (see
 * scripts/g2a-login.ts, scripts/g2a-scrape-authenticated.ts,
 * scripts/g2g-login.ts, scripts/g2g-scrape-google-accounts.ts, and the
 * README sections on authenticated scraping).
 *
 * IMPORTANT: the storage state file this writes/reads (see
 * getStorageStatePath) contains that account's live session cookies and
 * localStorage — it is EQUIVALENT TO A LOGGED-IN PASSWORD. Never commit it,
 * log its contents, or send it anywhere. It's already covered by
 * .gitignore ('.auth/').
 */

export type Site = 'g2a' | 'g2g';

export function getStorageStatePath(site: Site): string {
  return path.join('.auth', `${site}-storage-state.json`);
}

function ensureAuthDir(site: Site): void {
  mkdirSync(path.dirname(getStorageStatePath(site)), { recursive: true });
}

export function hasSavedSession(site: Site): boolean {
  return existsSync(getStorageStatePath(site));
}

/**
 * Launches a real, headed Chromium browser (headless: false — the user needs
 * to see the browser to log in, and to trust what's happening on their real
 * account) and creates a context from the saved session for `site` if one
 * exists.
 *
 * `fresh: true` skips loading any saved session even if one exists, so the
 * caller always gets a blank profile — used by scripts/g2a-login.ts and
 * scripts/g2g-login.ts, which exist specifically to (re-)create the saved
 * session.
 *
 * Caller is responsible for closing the returned browser/context.
 */
export async function launchAuthenticatedContext(
  site: Site,
  options: { fresh?: boolean } = {},
): Promise<{ browser: Browser; context: BrowserContext }> {
  const browser = await chromium.launch({ headless: false });
  const context = !options.fresh && hasSavedSession(site)
    ? await browser.newContext({ storageState: getStorageStatePath(site) })
    : await browser.newContext();

  return { browser, context };
}

export async function saveSession(site: Site, context: BrowserContext): Promise<void> {
  ensureAuthDir(site);
  await context.storageState({ path: getStorageStatePath(site) });
}
