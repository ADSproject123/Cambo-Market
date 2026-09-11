# cheap-staff bot

A Telegram bot that acts as a middleman for buying G2G listings: the bot
scrapes a category's listings itself and shows them to buyers directly in
Telegram (no pasting links), buyers tap Buy and pay via your QR code, upload
proof of payment, an admin confirms it, manually buys the item on G2G, and
delivers it back through the bot.

There's also a companion web app at [`web/`](web/) — a client/admin storefront
that shares this same Supabase project (same `products`/`orders` tables), so
an order placed on the web shows up for admins next to Telegram orders. See
[`web/README.md`](web/README.md) for its setup.

## How it works

1. Buyer sends `/start` → bot shows a **category menu** (whatever's currently
   in the `products` table — scraped from G2G or imported from anywhere
   else, e.g. G2A), each priced at cost **+ $1** (`CATALOG_MARKUP_USD`).
2. Buyer taps a category → sees its listings; taps one → sees title, price,
   seller, rating, with **Buy** / **Back to list** buttons (and **« All
   categories** from the list view).
3. Buyer taps **Buy** → bot marks the order `awaiting_payment` and sends your
   QR code image with the exact amount and your payment instructions.
4. Buyer uploads a screenshot after paying → bot forwards it to your admin
   chat with **Approve** / **Reject** buttons.
5. Admin taps **Approve** → buyer is told payment is confirmed. Admin then
   goes and manually buys the item on G2G, and **replies to the original
   order message** in the admin chat with the key/account details. The bot
   forwards that reply to the buyer and marks the order `fulfilled`.
   Admin taps **Reject** → buyer is told to retry/contact support.

An admin can also just paste a raw G2A/G2G link (any product, not only the
catalogued category) — the bot falls back to the original on-demand
lookup-and-quote flow for that. That path is documented further down.

All order/catalog state lives in Supabase (`orders` + `products` tables) —
nothing is held in bot memory, so it survives restarts.

## How the catalog scraping actually works

G2G's category **pages** (the HTML you'd get from a plain page load) only
embed an aggregate price range for SEO — not the individual listings. Those
are normally fetched client-side after the page loads. I found a more direct
route: G2G is built with SvelteKit, which exposes a
`https://www.g2g.com/categories/<slug>/__data.json` endpoint for client-side
navigation. It returns the *exact* same per-listing data the page renders
(title, price, seller, rating, a direct checkout URL) — reachable with a
plain HTTP GET, no cookies, no headless browser. That's what
[`src/scrapers/g2gCatalog.ts`](src/scrapers/g2gCatalog.ts) calls, decoding
the response with [`devalue`](https://github.com/Rich-Harris/devalue) (the
same serialization library SvelteKit uses to produce it).

This was confirmed by testing against the live site, not assumed — see the
scraping reality check below for what does/doesn't work and why.

**Refreshing the catalog**: an admin can run `/sync` (no args) in the admin
chat to re-scrape every category listed in `CATALOG_CATEGORIES` in
[`src/catalogSync.ts`](src/catalogSync.ts) — currently `google-accounts` and
`cnva-accounts`, the two categories confirmed scrapable from G2G. The bot
also does this once on startup. Run `/sync <slug>` to pull in one more G2G
category on demand without touching that list. There's no automatic polling
interval — add one (e.g. a `setInterval` around `syncAllCategories()` in
`src/index.ts`) if you want it to stay fresh without a manual `/sync`, but
weigh that against scraping-frequency risk (see below).

**Categories from elsewhere (e.g. G2A)**: the browsing menu is driven
directly by whatever's in the `products` table (`listCategories()` in
`src/db/products.ts`), not by `CATALOG_CATEGORIES` — so a category populated
by hand or imported from a site the scraper can't reach (G2A is blocked from
most server IPs, see below) still shows up and is fully sellable, it just
won't get auto-refreshed by `/sync`. Manage those via the web admin's Add
product / bulk import instead.

## Important: scraping reality check

I tested live against both sites before building this:

- **G2A** returns a 403 (Akamai bot protection) for essentially any request
  from a typical server/VPS IP, even a plain HTTP GET to the homepage — this
  is an IP-reputation block, not a fingerprinting issue, so it will very
  likely **not work out of the box** wherever you deploy this. To make G2A
  quoting work (via the link-paste fallback), set `SCRAPER_PROXY_URL` to a
  residential proxy, or swap in a scraping-unlocker API (ScraperAPI/ZenRows/
  Bright Data all work as a drop-in HTTP proxy). Until then, every G2A link
  falls through to the manual admin-quote flow — which the bot handles
  gracefully.
- **G2G** server-renders most pages, and its `__data.json` route works via
  plain HTTP fetch — testing showed Akamai actually blocks headless Chromium
  on G2G *harder* than it blocks a plain HTTP client, so avoiding a headless
  browser was the right call, not just the easy one.
- Both sites' Terms of Service prohibit automated scraping for commercial
  resale. This isn't a criminal issue, but it's a real risk: IP/account bans,
  and a cease-and-desist if you scale this up. G2A has an official
  **Integrator/Partner API** and G2G has an **Affiliate Program** — both are
  worth looking into as a compliant alternative/complement to scraping if you
  plan to run this as a real business. The `__data.json` endpoint is an
  internal implementation detail of G2G's frontend, not a published/supported
  API — it can change or get locked down without notice.
- Because scraping reliability will vary, admins can always override the
  price manually (the link-paste `needs_quote` flow) and should treat scraped
  prices as a starting point, not gospel — double-check before buying.

## Authenticated G2A scraping (experimental)

The scraping reality check above explains why G2A can't be scraped from
wherever this bot/server runs: G2A 403s essentially every request — even a
logged-out homepage load — from a typical server/datacenter IP. That's
IP-reputation blocking at the edge, not an auth wall, so logging in doesn't
fix it *from this kind of network*. It's a separate, parallel path from the
existing scraper — it doesn't replace or touch `src/lib/scrapers/g2a.ts`.

The workaround: run a real, visible browser logged into your own G2A account
from a network G2A doesn't block (your own machine, not this server), save
that login session to disk once, then reuse it for scraping runs. Two steps:

1. **`npm run login:g2a`** — opens a real Chromium window and navigates to
   G2A's login page. Log in by hand (this covers 2FA/CAPTCHA for free, since
   you're the one solving it), then press Enter in the terminal when you're
   logged in. Your session (cookies + localStorage) is saved to
   `.auth/g2a-storage-state.json` — gitignored, since it's equivalent to a
   logged-in password for your account. Re-run this any time you need to log
   in again (it always starts from a blank browser profile).
2. **`npm run scrape:g2a -- <url>`** — opens the given URL in a browser reusing
   that saved session. Refuses to run if you haven't logged in yet.

Both scripts are plain `tsx`-run Node scripts under [`scripts/`](scripts/),
built on shared helpers in
[`src/lib/scrapers/playwright/session.ts`](src/lib/scrapers/playwright/session.ts).

**This is a scaffold, not a finished scraper.** Nobody here has been able to
load a real G2A page to inspect its actual login form or product-page DOM —
that's blocked from this environment too, for the same IP-reputation reason.
So `scripts/g2a-scrape-authenticated.ts` opens the page and then hands you
the `page` object inside a clearly marked
`// ===== TODO(user): write your scraping logic below =====` section — fill
that in with real selectors once you can actually see the live page from your
own network. Everything before that TODO section (browser launch, session
reuse, navigation) is working scaffold; everything selector-shaped is an
unverified guess you need to confirm or replace yourself.

## Authenticated G2G scraping

Unlike G2A, G2G's plain-HTTP scraper
([`src/lib/scrapers/g2gCatalog.ts`](src/lib/scrapers/g2gCatalog.ts)) already
covers category listings without logging in (see the scraping reality check
above). This authenticated path exists for what that scraper *doesn't*
reach: an individual offer's detail page, specifically its overall stock
figure and its "other sellers" list (each seller's level, satisfaction rate,
sold count, min/available quantity, delivery time, and price). It shares the
same `.auth/`-based session approach as G2A, generalized in
[`src/lib/scrapers/playwright/session.ts`](src/lib/scrapers/playwright/session.ts)
to take a `site: 'g2a' | 'g2g'` argument.

1. **`npm run login:g2g`** — opens a real Chromium window and navigates to
   G2G's login page. If both `G2G_GMAIL` and `G2G_PASSWORD` are set, it
   auto-fills and submits the login form for you; otherwise log in by hand.
   Either way you get a chance to solve any CAPTCHA/2FA challenge before
   pressing Enter in the terminal, which saves the session to
   `.auth/g2g-storage-state.json` (gitignored, equivalent to a logged-in
   password). Re-run this any time you need to log in again.
2. **`npm run scrape:g2g`** — reuses that saved session to open
   `https://www.g2g.com/categories/google-accounts`, extract every product
   card, then visit each one's detail page for its stock and other-seller
   list, writing everything to `output/g2g-google-accounts.json` (gitignored
   scraped output). Refuses to run if you haven't logged in yet. Pauses
   briefly between detail-page visits to avoid hammering the site with a
   real authenticated account.

**Unlike the G2A scaffold above, the selectors in
[`scripts/g2g-scrape-google-accounts.ts`](scripts/g2g-scrape-google-accounts.ts)
are not guesses** — they were written against real HTML captured directly
from G2G's login page, category page, and an offer detail page. Still, worth
a live re-check before relying on this: DOM structure can drift over time,
and may vary slightly across individual offers.

## Setup

1. **Create the bot**: talk to [@BotFather](https://t.me/BotFather), get a
   `BOT_TOKEN`.
2. **Get your admin chat ID**: DM [@userinfobot](https://t.me/userinfobot)
   for your personal numeric ID, or create a Telegram group for your staff,
   add the bot to it, and use the group's chat ID (negative number). A single
   group is recommended so any staff member can approve/reject/quote/deliver/
   `/sync` from the same thread.
3. **Supabase**: create a project at [supabase.com](https://supabase.com),
   open the SQL editor, and run [`supabase/schema.sql`](supabase/schema.sql).
   Copy the Project URL and the **service role** key (Settings → API) into
   `.env` — the bot uses the service role key because it's a trusted backend
   that needs to read/write any user's orders.
4. **Payment QR**: drop your QR code image at `assets/payment-qr.png` (or
   point `PAYMENT_QR_IMAGE_PATH` elsewhere), and set `PAYMENT_INSTRUCTIONS` to
   whatever text should appear under it (bank name, account number, etc.).
5. Copy `.env.example` to `.env` and fill in the values above.

```bash
cp .env.example .env
npm install
npm run dev      # dev run with auto-reload
# or
npm run build && npm start   # compiled run
```

On startup the bot does an initial `/sync` automatically; if that fails
(network hiccup, G2G layout change) `/start` will still try one live fetch
before giving up, and an admin can always run `/sync` manually.

## Project layout

```
src/
  config.ts               env var loading
  pricing.ts               fee math (percent, used by the link-paste fallback)
  catalogSync.ts            categories list + scrape-and-upsert-to-Supabase
  scrapers/
    g2gCatalog.ts            category → all listings, via G2G's __data.json endpoint
    g2a.ts / g2g.ts / http.ts  single-URL lookup (link-paste fallback), JSON-LD/meta parsing
  db/                       Supabase client + orders/users/products queries
  bot/
    handlers/
      start.ts               /start → shows the catalog
      catalog.ts              list listings, show detail, buy from catalog
      lookup.ts                link-paste fallback (any G2A/G2G URL)
      order.ts                 QR/payment, cancel, screenshot upload
      admin.ts                  approve/reject, quote replies, deliver replies
    keyboards.ts              inline button builders
    auth.ts                    admin chat/user check
    notifyAdmins.ts            broadcast helper + reply-tracking
supabase/schema.sql        run once in the Supabase SQL editor
```

## Known limitations / next steps

- No automatic refresh interval — `/sync` is manual (plus one sync on
  startup). Add a timer if you want it hands-off, but scraping too often
  raises the odds of getting rate-limited/blocked.
- Only one active `awaiting_payment` order per buyer is tracked at a time
  (the next screenshot they send is matched to their most recent one). Fine
  for a small bot; add explicit order selection if buyers place concurrent orders.
- No payment gateway integration — this is intentionally a manual
  QR-and-screenshot flow with human approval, not automated payment
  verification.
- The `__data.json` endpoint is unofficial/reverse-engineered (see the
  scraping reality check) — if G2G changes its frontend build, catalog
  scraping may need updating even though nothing else about the bot changed.
