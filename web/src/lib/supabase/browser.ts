import { createBrowserClient } from '@supabase/ssr';

/** Anon-key client for use in Client Components — safe to expose, only used for auth (sign in/up/out). */
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
