import { NextResponse } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth';
import { getProduct } from '@/lib/db/products';
import { createWebOrder } from '@/lib/db/orders';
import { sellPrice } from '@/lib/pricing';
import { notifyAdminsRaw } from '@/lib/telegram/notify';

export async function POST(request: Request) {
  try {
    const user = await requireRole('client');
    const { offerId } = (await request.json()) as { offerId?: string };
    if (!offerId) return NextResponse.json({ error: 'offerId is required' }, { status: 400 });

    const product = await getProduct(offerId);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const order = await createWebOrder({
      webUserId: user.id,
      productOfferId: product.offer_id,
      productUrl: product.url,
      productTitle: product.title,
      basePrice: product.base_price,
      currency: product.currency,
      totalAmount: sellPrice(product.base_price),
    });

    const buyerInfo = user.id.startsWith('tg_') 
      ? `Telegram User <code>${user.id.slice(3)}</code>` 
      : `Web User <code>${user.email || user.id.slice(0, 8)}</code>`;
      
    await notifyAdminsRaw(
      order.id,
      `🆕 <b>New Web Order!</b>\n\n<b>Order ID:</b> <code>${order.id}</code>\n<b>Item:</b> ${order.product_title}\n<b>Price:</b> ${order.currency} ${order.total_amount}\n<b>Buyer:</b> ${buyerInfo}\n\n<i>Awaiting payment.</i>`
    );

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
