const BOT_TOKEN = process.env.BOT_TOKEN;

/**
 * Sends a plain message to a Telegram chat via the raw Bot API (no telegraf
 * dependency needed for this one-way notification). Used when an admin
 * approves/rejects/delivers a Telegram-originated order from the web
 * dashboard, so the buyer gets notified in the channel they ordered from —
 * this is what makes "one shared order queue" actually true across channels.
 * No-ops (logs a warning) if BOT_TOKEN isn't configured, since Telegram
 * notifications are optional for a web-only deployment.
 */
export async function notifyTelegramUser(chatId: number, text: string): Promise<void> {
  if (!BOT_TOKEN) {
    console.warn('BOT_TOKEN not set — skipping Telegram notification to', chatId);
    return;
  }

  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });

  if (!res.ok) {
    console.error('Failed to notify Telegram user', chatId, await res.text());
  }
}

/** Fetches a Telegram-uploaded file's bytes via its file_id, for the admin dashboard to preview payment screenshots. */
export async function fetchTelegramFile(fileId: string): Promise<{ contentType: string; body: ReadableStream } | null> {
  if (!BOT_TOKEN) return null;

  const infoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
  if (!infoRes.ok) return null;
  const info = (await infoRes.json()) as { ok: boolean; result?: { file_path?: string } };
  if (!info.ok || !info.result?.file_path) return null;

  const fileRes = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${info.result.file_path}`);
  if (!fileRes.ok || !fileRes.body) return null;

  return { contentType: fileRes.headers.get('content-type') ?? 'image/jpeg', body: fileRes.body };
}
