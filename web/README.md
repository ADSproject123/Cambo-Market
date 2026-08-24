# cheap-staff web app

A Next.js storefront + admin dashboard sharing the same Supabase project as
the Telegram bot (`../`). Two roles:

- **client** — browse products, buy (QR + screenshot proof, same manual flow
  as the bot), track their own orders.
- **admin** — manage products (manual add/edit/delete, or a "Sync now" button
  that re-runs the same G2G scraper the bot uses), and manage *all* orders
  regardless of which channel they came from (Telegram or web) — approve,
  reject, or deliver.

Because both apps point at the same `orders`/`products` tables, an order
placed on the web shows up for admins next to Telegram orders, and vice
versa. If an admin approves/rejects/delivers a **Telegram-originated** order
from this web dashboard, it also sends the buyer a Telegram message (via
`BOT_TOKEN`), so buyers get notified in whichever channel they ordered from.

## Setup

1. Run [`../supabase/schema.sql`](../supabase/schema.sql) if you haven't
   already (from setting up the bot), then run
   [`../supabase/schema_web.sql`](../supabase/schema_web.sql) — it adds the
   `profiles` table (auth roles), lets `orders` originate from a web user
   instead of only Telegram, and creates the private `payment-proofs`
   storage bucket.
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase
   project's URL + anon key + service role key (same project as the bot).
   `BOT_TOKEN` is optional (only needed for the cross-channel Telegram
   notification described above).
3. Drop your payment QR image at `public/payment-qr.png` — use the exact
   same image as the bot's `assets/payment-qr.png` so both channels agree.
4. **Bootstrap your first admin**: sign up once via `/signup` in the running
   app, then in the Supabase SQL editor run:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
   Any further admins are promoted the same way (there's no admin-management
   UI yet — see Known limitations).

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

## Project layout

```
src/
  proxy.ts                  refreshes the Supabase session cookie on every request
  lib/
    supabase/
      browser.ts              anon-key client, Client Components only (auth)
      server.ts                anon-key client + cookies, Server Components (who's logged in)
      admin.ts                 service-role client, server-only (all real data access)
    auth.ts                   getSessionUser / requireRole
    db/
      products.ts               product queries + manual CRUD + scraped upsert
      orders.ts                  order queries, shared shape with the bot's orders table
    scrapers/g2gCatalog.ts     same G2G category scraper as the bot (kept in sync manually)
    telegram/notify.ts        cross-channel notify + screenshot proxy for Telegram-originated orders
    storage.ts                Supabase Storage upload/signed-URL for web-uploaded screenshots
    pricing.ts                base price + CATALOG_MARKUP_USD
  app/
    page.tsx                  storefront (product grid)
    products/[offerId]/        product detail + Buy
    checkout/[orderId]/         QR + screenshot upload + status
    orders/                    client's own order history
    login/, signup/            Supabase Auth forms
    admin/                     role-gated (layout.tsx redirects non-admins)
      products/                 CRUD table + Sync now button
      orders/                    unified order queue, approve/reject/deliver
    api/                       route handlers backing all of the above
```

## Known limitations / next steps

- No admin-management UI — promote admins via the SQL editor (see Setup).
- `src/lib/scrapers/g2gCatalog.ts` is a duplicate of the bot's copy at
  `../src/scrapers/g2gCatalog.ts`, not a shared package. If G2G's frontend
  changes and you fix the scraper in one place, update the other too (or
  extract both into an npm workspace if this starts to hurt).
- Client order status doesn't live-update — the buyer has to refresh
  `/checkout/[id]` or `/orders` to see a status change. Fine for a manual
  approval flow with realistic turnaround times; add polling or a Supabase
  Realtime subscription if you want it instant.
- Payment screenshots for web orders are private Supabase Storage objects,
  viewed by admins via short-lived signed URLs generated on demand.
