import type { Context } from 'telegraf';
import { upsertUserFromCtx } from '../../db/users.js';

export async function handleStart(ctx: Context): Promise<void> {
  await upsertUserFromCtx(ctx);
  await ctx.reply(
    [
      '👋 Welcome!',
      '',
      'Send me a product link from g2a.com or g2g.com and I\'ll quote you a price.',
      '',
      'How it works:',
      '1. Paste the product link.',
      '2. I show you the price (mine includes a small service fee).',
      '3. Tap Buy — I\'ll show you a QR code to pay.',
      '4. Upload a screenshot of your payment.',
      '5. Once an admin confirms it, we buy the item for you and deliver it here.',
    ].join('\n'),
  );
}
