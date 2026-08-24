-- Run this once in the Supabase SQL editor for your project.

create table if not exists users (
  telegram_user_id bigint primary key,
  username text,
  first_name text,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id bigint not null references users(telegram_user_id),
  marketplace text not null check (marketplace in ('g2a', 'g2g')),
  product_url text not null,
  product_title text,
  scraped_price numeric,
  currency text not null default 'USD',
  service_fee_percent numeric not null default 0,
  total_amount numeric,
  status text not null default 'draft' check (
    status in (
      'draft',            -- link received, price known (or scrape failed) but user hasn't hit Buy
      'needs_quote',       -- scrape failed, waiting on admin to reply with a manual price
      'awaiting_payment',  -- QR shown, waiting for user to pay + upload proof
      'pending_review',    -- screenshot uploaded, waiting on admin approve/reject
      'approved',          -- admin confirmed payment, will purchase manually on G2A/G2G
      'rejected',          -- admin rejected the payment proof
      'fulfilled',         -- admin delivered the key/account to the buyer
      'cancelled'
    )
  ),
  payment_screenshot_file_id text,
  admin_notify_chat_id bigint,
  admin_notify_message_id bigint,
  admin_note text,
  delivered_content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_telegram_user_id_idx on orders(telegram_user_id);
create index if not exists orders_status_idx on orders(status);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row
  execute function set_updated_at();
