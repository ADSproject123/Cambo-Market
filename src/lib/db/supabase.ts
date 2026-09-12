import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

// Lazily constructed: config.supabaseUrl/supabaseServiceRoleKey must only be
// read on first actual use (a real request), not at module-import time —
// this module gets imported transitively by every route via the root
// layout, and Next.js statically prerenders a few routes (e.g. the
// auto-generated /_not-found) at BUILD time, when Vercel deliberately
// withholds Secret-type env vars (they're only injected into real
// request-time serverless function invocations). An eager
// `createClient(...)` call here would crash the production build over a
// page that never actually queries Supabase. The Proxy below preserves the
// exact same `supabase.from(...)` call sites used everywhere else.
let client: SupabaseClient | undefined;

function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const real = getClient();
    const value = Reflect.get(real, prop);
    return typeof value === 'function' ? value.bind(real) : value;
  },
});
