import { NextResponse } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth';
import { getOrder, updateOrder } from '@/lib/db/orders';
import { notifyTelegramUser } from '@/lib/telegram/notify';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('admin');
    const { id } = await params;
    const { content } = (await request.json()) as { content?: string };
    if (!content?.trim()) return NextResponse.json({ error: 'content is required' }, { status: 400 });

    const order = await getOrder(id);
    if (!order || order.status !== 'approved') {
      return NextResponse.json({ error: 'Order is not approved yet.' }, { status: 409 });
    }

    await updateOrder(id, { delivered_content: content, status: 'fulfilled' });

    if (order.telegram_user_id) {
      await notifyTelegramUser(order.telegram_user_id, `🎁 Order fulfilled! Here's your item:\n\n${content}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
