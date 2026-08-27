import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Privileged, service-role Supabase client — bypasses RLS entirely.
 * SERVER-SIDE ONLY. Never import this from a Client Component or expose
 * SUPABASE_SERVICE_ROLE_KEY to the browser. All authorization (who's a
 * client vs admin, who owns which order) is enforced in application code
 * via lib/auth.ts before this client is used.
 */
export function createAdminClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
