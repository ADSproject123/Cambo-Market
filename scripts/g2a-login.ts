// Run manually: `tsx scripts/g2a-login.ts` (or `npm run login:g2a`).
//
// Opens a real, visible Chromium window so you can log in to your OWN G2A
// account by hand — including any 2FA/CAPTCHA — then saves the resulting
// cookies/localStorage to disk so scripts/g2a-scrape-search.ts (and
// scripts/g2a-scrape-authenticated.ts) can reuse that session later without
// logging in again.
//
// This must be run from a network G2A doesn't block (see the README section
// "Authenticated G2A scraping" for why — this server's IP gets a flat 403
// from G2A regardless of auth).
//
// This script always starts from a blank browser profile (`fresh: true`),
// ignoring any previously saved session, so re-running it is the supported
// way to (re-)log in, e.g. once a saved session expires.

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { launchAuthenticatedContext, saveSession, getStorageStatePath } from '../src/lib/scrapers/playwright/session';

// Real login URL (confirmed from an actual browser session — the previous
// guess, https://www.g2a.com/login, was wrong: login lives on a separate
// subdomain).
const G2A_LOGIN_URL =
  'https://login.g2a.com/?redirect_uri=https%253A%252F%252Fwww.g2a.com%252F&source=topbar';

async function main(): Promise<void> {
  const { browser, context } = await launchAuthenticatedContext('g2a', { fresh: true });
  const page = await context.newPage();
  await page.goto(G2A_LOGIN_URL);

  const email = process.env.G2A_GMAIL;
  const password = process.env.G2A_PASSWORD;

  if (email && password) {
    // Optional, opt-in auto-fill path — only runs when BOTH G2A_GMAIL and
    // G2A_PASSWORD are set in the environment. Selectors below are
    // real/confirmed (from an actual captured login form), not guesses:
    // the email/password inputs are matched by their stable `name`
    // attribute (their `id` is a per-render random react-aria value, not
    // usable as a selector), and the submit button is the form's single
    // type="submit" button (labeled "Sign in").
    console.log('G2A_GMAIL/G2A_PASSWORD are set — auto-filling the login form.');
    try {
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill(password);
      await page.locator('button[type="submit"]').click();
    } catch {
      // Deliberately not logging the caught error: Playwright's fill()
      // embeds the literal value it tried to type into its own action
      // call-log, which gets appended verbatim to the error's message on
      // failure — logging it here would print the raw G2A_PASSWORD to stdout.
      console.log('Auto-fill failed — log in manually below instead.');
    }
  } else {
    console.log('G2A_GMAIL/G2A_PASSWORD not set — log in manually below.');
  }

  console.log('');
  console.log('If a CAPTCHA or 2FA prompt appeared, solve it now. Once you\'re');
  console.log('fully logged in, press Enter here to save the session.');
  console.log('');

  const rl = createInterface({ input: stdin, output: stdout });
  await rl.question('Press Enter once logged in... ');
  rl.close();

  await saveSession('g2a', context);
  console.log(`Session saved to ${getStorageStatePath('g2a')}`);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
