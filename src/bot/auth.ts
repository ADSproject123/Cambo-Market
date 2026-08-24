import type { Context } from 'telegraf';
import { config } from '../config.js';

/** True if this update comes from an admin: either a configured staff group chat, or a configured individual admin's DM. */
export function isAdminContext(ctx: Context): boolean {
  const chatId = ctx.chat?.id;
  const fromId = ctx.from?.id;
  return (
    (chatId !== undefined && config.adminChatIds.includes(chatId)) ||
    (fromId !== undefined && config.adminChatIds.includes(fromId))
  );
}
