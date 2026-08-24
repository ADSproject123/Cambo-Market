# cheap-staff bot

A Telegram bot that acts as a middleman for buying listings from G2A and G2G:
a buyer pastes a product link, the bot quotes a price, shows your payment QR
code, the buyer uploads proof of payment, an admin confirms it in Telegram,
manually buys the item on G2A/G2G, and delivers it back through the bot.

## How it works

1. Buyer sends `/start`, then pastes a G2A or G2G product link.
2. The bot fetches the page and tries to read the price automatically.
   - If it succeeds: shows the price (+ your service fee) with **Buy** / **Cancel** buttons.
   - If it fails: forwards the link to your admin chat and asks an admin to
     reply with the price manually (reply to that message with just a number,
     e.g. `24.99`). The bot then sends the buyer the same Buy/Cancel prompt.
3. Buyer taps **Buy** → bot marks the order `awaiting_payment` and sends your
   QR code image with the exact amount and your payment instructions.
4. Buyer uploads a screenshot after paying → bot forwards it to your admin
   chat with **Approve** / **Reject** buttons.
5. Admin taps **Approve** → buyer is told payment is confirmed. Admin then
   goes and manually buys the item on G2A/G2G, and **replies to the original
   order message** in the admin chat with the key/account details. The bot
   forwards that reply to the buyer and marks the order `fulfilled`.
   Admin taps **Reject** → buyer is told to retry/contact support.

All order state lives in Supabase (`orders` table) — nothing is held in bot
memory, so it survives restarts.

## Important: scraping reality check

I tested live against both sites before building this:

- **G2A** returns a 403 (Akamai bot protection) for essentially any request
  from a typical server/VPS IP, even a plain HTTP GET to the homepage — this
  is an IP-reputation block, not a fingerprinting issue, so it will very
  likely **not work out of the box** wherever you deploy this. To make G2A
  quoting work, set `SCRAPER_PROXY_URL` to a residential proxy, or swap in a
  scraping-unlocker API (ScraperAPI/ZenRows/Bright Data all work as a drop-in
  HTTP proxy). Until then, every G2A link will fall through to the manual
  admin-quote flow — which the bot handles gracefully.
- **G2G** server-renders most pages, so a plain HTTP fetch (what this bot
  does) works where a real browser doesn't — testing showed Akamai blocks
  headless Chromium on G2G harder than it blocks a plain HTTP client. A
  specific offer link (`g2g.com/categories/<cat>/offer/<id>`) should return a
  real price via embedded JSON-LD. A category/search link only carries an
  aggregate price range across many sellers, which the bot labels as an
  estimate and still routes through admin confirmation.
- Both sites' Terms of Service prohibit automated scraping for commercial
  resale. This isn't a criminal issue, but it's a real risk: IP/account bans,
  and a cease-and-desist if you scale this up. G2A has an official
  **Integrator/Partner API** and G2G has an **Affiliate Program** — both are
  worth looking into as a compliant alternative/complement to scraping if you
  plan to run this as a real business.
- Because scraping reliability will vary, admins can always override the
  price manually (the `needs_quote` flow) and should treat the scraped price
  as a starting point, not gospel — double-check before buying.

## Setup

1. **Create the bot**: talk to [@BotFather](https://t.me/BotFather), get a
   `BOT_TOKEN`.
2. **Get your admin chat ID**: DM [@userinfobot](https://t.me/userinfobot)
   for your personal numeric ID, or create a Telegram group for your staff,
   add the bot to it, and use the group's chat ID (negative number). A single
   group is recommended so any staff member can approve/reject/quote/deliver
   from the same thread.
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
npm run dev      # ts-node style dev run with auto-reload
# or
npm run build && npm start   # compiled run
```

## Project layout

```
src/
  config.ts            env var loading
  pricing.ts            fee math
  scrapers/              G2A/G2G page fetching + parsing (plain HTTP, no headless browser)
  db/                    Supabase client + orders/users queries
  bot/
    handlers/            start, link lookup, buy/cancel, admin approve/reject/reply
    keyboards.ts          inline button builders
    auth.ts                admin chat/user check
    notifyAdmins.ts        broadcast helper + reply-tracking
supabase/schema.sql     run once in the Supabase SQL editor
```

## Known limitations / next steps

- Only one active `awaiting_payment` order per buyer is tracked at a time
  (the next screenshot they send is matched to their most recent one). Fine
  for a small bot; add explicit order selection if buyers place concurrent orders.
- No payment gateway integration — this is intentionally a manual
  QR-and-screenshot flow with human approval, not automated payment
  verification.
- No rate limiting on link lookups — add one if this gets public traffic,
  since each lookup makes an outbound request to G2A/G2G.
