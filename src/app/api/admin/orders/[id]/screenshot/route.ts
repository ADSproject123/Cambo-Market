import { NextResponse } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth';
import { getOrder } from '@/lib/db/orders';
import { signedScreenshotUrl } from '@/lib/storage';
import { fetchTelegramFile } from '@/lib/telegram/notify';

/**
 * Unifies screenshot viewing across channels for the admin dashboard: a
 * web-originated order's proof lives in Supabase Storage (redirect to a
 * signed URL); a Telegram-originated order's proof lives on Telegram's
 * servers (proxy the bytes through, using the bot token server-side).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('admin');
    const { id } = await params;

    const order = await getOrder(id);
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    if (order.payment_screenshot_url) {
      const url = await signedScreenshotUrl(order.payment_screenshot_url);
      if (!url) return NextResponse.json({ error: 'Could not sign screenshot URL.' }, { status: 500 });
      return NextResponse.redirect(url);
    }

    if (order.payment_screenshot_file_id) {
      const file = await fetchTelegramFile(order.payment_screenshot_file_id);
      if (!file) return NextResponse.json({ error: 'Could not fetch Telegram file.' }, { status: 502 });
      return new NextResponse(file.body, { headers: { 'content-type': file.contentType } });
    }

    return NextResponse.json({ error: 'No screenshot on this order.' }, { status: 404 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
