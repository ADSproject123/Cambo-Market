import { NextResponse } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth';
import { getOrder, updateOrder } from '@/lib/db/orders';
import { notifyTelegramUser } from '@/lib/telegram/notify';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('admin');
    const { id } = await params;

    const order = await getOrder(id);
    if (!order || order.status !== 'pending_review') {
      return NextResponse.json({ error: 'Order is not pending review.' }, { status: 409 });
    }

    await updateOrder(id, { status: 'approved' });

    if (order.telegram_user_id) {
      await notifyTelegramUser(
        order.telegram_user_id,
        `✅ Payment confirmed for your order! We're purchasing your item now — you'll receive it here shortly.`,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
