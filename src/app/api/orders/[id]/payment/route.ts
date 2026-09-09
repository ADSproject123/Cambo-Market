import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getOrder, updateOrder } from '@/lib/db/orders';
import { uploadPaymentScreenshot } from '@/lib/storage';
import { createAdminClient } from '@/lib/supabase/admin';
import { notifyAdminsPhotoRaw } from '@/lib/telegram/notify';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const order = await getOrder(id);
  const isOwner = order && (user.id.startsWith('tg_') 
    ? order.telegram_user_id === parseInt(user.id.slice(3), 10)
    : order.web_user_id === user.id);
  if (!order || !isOwner) {
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

  const adminDb = createAdminClient();
  const { data } = await adminDb.storage.from('payment-proofs').createSignedUrl(path, 60 * 60);
  if (data?.signedUrl) {
    const caption = `💳 <b>Payment Proof Uploaded</b>\n\n<b>Order ID:</b> <code>${order.id}</code>\n<b>Item:</b> ${order.product_title}\n\nPlease check the web dashboard to approve or reject this payment.`;
    await notifyAdminsPhotoRaw(order.id, data.signedUrl, caption);
  }

  return NextResponse.json({ ok: true });
}
