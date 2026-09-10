import type { Context } from 'telegraf';
import { supabase } from './supabase';

export async function upsertUserFromCtx(ctx: Context): Promise<void> {
  const from = ctx.from;
  if (!from) return;

  const { error } = await supabase.from('users').upsert(
    {
      telegram_user_id: from.id,
      username: from.username ?? null,
      first_name: from.first_name ?? null,
    },
    { onConflict: 'telegram_user_id' },
  );

  if (error) throw error;
}
