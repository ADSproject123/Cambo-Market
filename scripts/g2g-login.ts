// Run manually: `tsx scripts/g2g-login.ts` (or `npm run login:g2g`).
//
// Opens a real, visible Chromium window and navigates to G2G's login page.
// If G2G_GMAIL and G2G_PASSWORD are both set, auto-fills and submits the
// login form (selectors below are real/verified, not guesses — see
// AGENTS.md); otherwise you log in by hand. Either way, you get a chance to
// solve any CAPTCHA/2FA challenge before pressing Enter to save the session,
// so scripts/g2g-scrape-google-accounts.ts can reuse it later without
// logging in again.
//
// This script always starts from a blank browser profile (`fresh: true`),
// ignoring any previously saved session, so re-running it is the supported
// way to (re-)log in, e.g. once a saved session expires.

import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { launchAuthenticatedContext, saveSession, getStorageStatePath } from '../src/lib/scrapers/playwright/session';

const G2G_LOGIN_URL = 'https://www.g2g.com/login';

async function main(): Promise<void> {
  const { browser, context } = await launchAuthenticatedContext('g2g', { fresh: true });
  const page = await context.newPage();
  await page.goto(G2G_LOGIN_URL);

  const email = process.env.G2G_GMAIL;
  const password = process.env.G2G_PASSWORD;

  if (email && password) {
    console.log('G2G_GMAIL/G2G_PASSWORD are set — auto-filling the login form.');
    try {
      // The email input has a stable data-attr; its `id` is a per-render
      // random UUID and not usable as a selector. The password input has no
      // data-attr, so it's scoped to the form that holds the email input
      // (there's exactly one such form on the login page). The submit
      // button is distinguished from the "Later" button by type="submit".
      const loginForm = page.locator('form').filter({ has: page.locator('input[data-attr="username-input"]') });
      await page.locator('input[data-attr="username-input"]').fill(email);
      await loginForm.locator('input[type="password"]').fill(password);
      await loginForm.locator('button[type="submit"]').click();
    } catch {
      // Deliberately not logging the caught error: Playwright's fill()
      // embeds the literal value it tried to type into its own action
      // call-log, which gets appended verbatim to the error's message on
      // failure (e.g. a field that's present but not yet interactable) —
      // logging it here would print the raw G2G_PASSWORD to stdout.
      console.log('Auto-fill failed — log in manually below instead.');
    }
  } else {
    console.log('G2G_GMAIL/G2G_PASSWORD not set — log in manually below.');
  }

  console.log('');
  console.log('If a CAPTCHA or 2FA prompt appeared, solve it now. Once you\'re');
  console.log('fully logged in, press Enter here to save the session.');
  console.log('');

  const rl = createInterface({ input: stdin, output: stdout });
  await rl.question('Press Enter once logged in... ');
  rl.close();

  await saveSession('g2g', context);
  console.log(`Session saved to ${getStorageStatePath('g2g')}`);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
