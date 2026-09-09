import { createClient } from './supabase/server';
import { createAdminClient } from './supabase/admin';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { config } from './config';

export type Role = 'client' | 'admin';

export interface SessionUser {
  id: string;
  email: string | null;
  role: Role;
}

/** Who's logged in, and what role do they have — or null if not signed in. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (user) {
    const admin = createAdminClient();
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    return { id: user.id, email: user.email ?? null, role: (profile?.role as Role) ?? 'client' };
  }

  // Check for Telegram Mini App session
  const cookieStore = await cookies();
  const tgSession = cookieStore.get('tg_session')?.value;
  if (tgSession) {
    const [telegramId, signature] = tgSession.split('.');
    if (telegramId && signature) {
      const expectedSignature = crypto.createHmac('sha256', config.botToken).update(telegramId).digest('hex');
      if (signature === expectedSignature) {
        return { id: `tg_${telegramId}`, email: null, role: 'client' };
      }
    }
  }

  return null;
}

/** Throws if nobody's logged in, or if they don't have the required role. Use in route handlers/server actions before touching data. */
export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError('Not signed in.', 401);
  if (role === 'admin' && user.role !== 'admin') throw new AuthError('Admins only.', 403);
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
