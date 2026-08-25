import type { Context } from 'telegraf';
import { upsertUserFromCtx } from '../../db/users.js';
import { handleShowCategoryMenu } from './catalog.js';

export async function handleStart(ctx: Context): Promise<void> {
  await upsertUserFromCtx(ctx);
  await ctx.reply(
    [
      '👋 Welcome!',
      '',
      'Browse a category, tap a listing to see the price, then Buy.',
      "I'll show you a QR code to pay — upload a screenshot of your payment after, and once an admin confirms it, we buy the item for you and deliver it here.",
    ].join('\n'),
  );
  await handleShowCategoryMenu(ctx);
}
