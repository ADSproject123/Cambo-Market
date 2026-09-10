import type { Context } from 'telegraf';
import { Markup } from 'telegraf';
import { upsertUserFromCtx } from '../../lib/db/users';
import { config } from '../../lib/config';

export async function handleStart(ctx: Context): Promise<void> {
  await upsertUserFromCtx(ctx);
  await ctx.reply(
    [
      '👋 Welcome to Cambo Market!',
      '',
      'Click the button below to open our Mini App and browse the full catalog directly inside Telegram.',
    ].join('\n'),
    Markup.inlineKeyboard([
      Markup.button.webApp('🛒 Open Mini App', config.webAppUrl)
    ])
  );
}
