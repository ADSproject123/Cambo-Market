import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getOrder, updateOrder } from '@/lib/db/orders';
import { uploadPaymentScreenshot } from '@/lib/storage';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const order = await getOrder(id);
  if (!order || order.web_user_id !== user.id) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }
  if (order.status !== 'awaiting_payment') {
    return NextResponse.json({ error: 'This order is not awaiting payment.' }, { status: 409 });
  }

  const form = await request.formData();
  const file = form.get('screenshot');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'A screenshot file is required.' }, { status: 400 });
  }

  const path = await uploadPaymentScreenshot(order.id, file);
  await updateOrder(order.id, { payment_screenshot_url: path, status: 'pending_review' });

  return NextResponse.json({ ok: true });
}
