-- Run this once in the Supabase SQL editor, AFTER schema.sql, to add the
-- web app's auth roles and let orders originate from the web too.

do $$ begin
  create type user_role as enum ('client', 'admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role user_role not null default 'client',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
drop policy if exists "users can read own profile" on profiles;
create policy "users can read own profile" on profiles for select using (auth.uid() = id);

-- Auto-create a profile row (role defaults to 'client') whenever someone signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'client');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Orders can now originate from the web app too, not just Telegram — exactly
-- one of telegram_user_id / web_user_id is set per order.
alter table orders alter column telegram_user_id drop not null;
alter table orders add column if not exists web_user_id uuid references auth.users(id);
alter table orders add column if not exists payment_screenshot_url text;

alter table orders drop constraint if exists orders_channel_check;
alter table orders add constraint orders_channel_check check (
  (telegram_user_id is not null and web_user_id is null) or
  (telegram_user_id is null and web_user_id is not null)
);

-- Product catalog is public read (storefront); all writes go through the
-- Next.js server (service role, role-checked in application code).
alter table products enable row level security;
drop policy if exists "public can read products" on products;
create policy "public can read products" on products for select using (true);

-- Orders: intentionally NO policies for anon/authenticated roles. Every
-- read/write goes through Next.js route handlers using the service role key
-- (bypasses RLS), which enforce "clients see only their own orders, admins
-- see everything" in application code (see web/src/lib/auth.ts).
alter table orders enable row level security;

-- Private bucket for buyer-uploaded payment screenshots from the web channel
-- (Telegram screenshots stay on Telegram, referenced by file_id as before).
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- To make your first admin, after they've signed up once via /signup:
-- update public.profiles set role = 'admin' where email = 'you@example.com';
