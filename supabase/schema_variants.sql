-- Run this once in the Supabase SQL editor, after schema.sql and schema_web.sql,
-- to support price tiers (e.g. 1 Month / 3 Months / 12 Months) on one product.
--
-- Design: additive and backward-compatible. A product row with variant_group
-- = null behaves exactly as before (its own standalone card, own price).
-- Rows that share the same variant_group are treated as price tiers of the
-- same underlying item — the storefront groups them into one card with a
-- tier selector, and variant_label ("1 Month", "3 Months", ...) is what's
-- shown for each option. The `orders` table is untouched: buying a specific
-- tier is just buying that specific product row, same as always.

alter table products add column if not exists variant_group text;
alter table products add column if not exists variant_label text;

create index if not exists products_variant_group_idx on products(variant_group);
