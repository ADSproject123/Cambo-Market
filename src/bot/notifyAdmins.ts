import type { Telegram } from 'telegraf';
import { config } from '../lib/config.js';
import { updateOrder } from '../lib/db/orders.js';
import type { OrderRow } from '../lib/db/orders.js';
import { logger } from '../lib/logger.js';

/**
 * Broadcasts a message to every configured admin chat, and remembers the
 * (chat_id, message_id) of the FIRST admin chat on the order row — that
 * chat is the one whose replies get treated as a quote/delivery reply.
 * For a team, set ADMIN_CHAT_IDS to a single staff group so everyone can
 * act from the same thread.
 */
export async function notifyAdmins(
  telegram: Telegram,
  order: OrderRow,
  text: string,
  extraMarkup?: Parameters<Telegram['sendMessage']>[2],
): Promise<void> {
  let primary: { chatId: number; messageId: number } | undefined;

  for (const chatId of config.adminChatIds) {
    try {
      const sent = await telegram.sendMessage(chatId, text, { parse_mode: 'HTML', ...extraMarkup });
      if (!primary) primary = { chatId, messageId: sent.message_id };
    } catch (err) {
      logger.error(`Failed to notify admin chat ${chatId}`, err);
    }
  }

  if (primary) {
    await updateOrder(order.id, {
      admin_notify_chat_id: primary.chatId,
      admin_notify_message_id: primary.messageId,
    });
  }
}

/** Same as notifyAdmins but sends the buyer's payment-proof screenshot with a caption. */
export async function notifyAdminsWithPhoto(
  telegram: Telegram,
  order: OrderRow,
  photoFileId: string,
  caption: string,
  extraMarkup?: Parameters<Telegram['sendPhoto']>[2],
): Promise<void> {
  let primary: { chatId: number; messageId: number } | undefined;

  for (const chatId of config.adminChatIds) {
    try {
      const sent = await telegram.sendPhoto(chatId, photoFileId, {
        caption,
        parse_mode: 'HTML',
        ...extraMarkup,
      });
      if (!primary) primary = { chatId, messageId: sent.message_id };
    } catch (err) {
      logger.error(`Failed to notify admin chat ${chatId} with photo`, err);
    }
  }

  if (primary) {
    await updateOrder(order.id, {
      admin_notify_chat_id: primary.chatId,
      admin_notify_message_id: primary.messageId,
    });
  }
}
