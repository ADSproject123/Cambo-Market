import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Session-aware Supabase client for Server Components / Route Handlers.
 * Uses the anon key + the visitor's own cookies — only good for finding out
 * who's logged in (auth.getUser()). Actual data access goes through the
 * service-role client in admin.ts after checking their role.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component render — middleware refreshes the
          // session cookie instead, so this can be safely ignored.
        }
      },
    },
  });
}
