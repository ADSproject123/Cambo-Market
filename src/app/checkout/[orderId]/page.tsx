import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { getOrder } from '@/lib/db/orders';
import { getSessionUser } from '@/lib/auth';
import { formatMoney } from '@/lib/pricing';
import PaymentUploadForm from '@/components/PaymentUploadForm';

const PAYMENT_INSTRUCTIONS = process.env.PAYMENT_INSTRUCTIONS || 'Contact us for payment details.';

export default async function CheckoutPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const order = await getOrder(orderId);
  const isOwner = order && (user.id.startsWith('tg_') 
    ? order.telegram_user_id === parseInt(user.id.slice(3), 10)
    : order.web_user_id === user.id);
  if (!order || !isOwner) notFound();

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold dark:text-white">Order {order.id.slice(0, 8).toUpperCase()}</h1>
      <p className="mt-1 text-neutral-600 dark:text-neutral-400">{order.product_title}</p>
      <p className="mt-2 text-2xl font-bold dark:text-white">{formatMoney(order.total_amount ?? 0, order.currency)}</p>

      {order.status === 'awaiting_payment' && (
        <>
          <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <Image src="/payment-qr.png" alt="Payment QR code" width={280} height={280} className="mx-auto" />
            <p className="mt-3 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-400">{PAYMENT_INSTRUCTIONS}</p>
          </div>
          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">After paying, upload a screenshot as proof:</p>
          <PaymentUploadForm orderId={order.id} />
        </>
      )}

      {order.status === 'pending_review' && (
        <p className="mt-6 rounded bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          Payment proof received — waiting for an admin to confirm it.
        </p>
      )}
      {order.status === 'approved' && (
        <p className="mt-6 rounded bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
          Payment confirmed! We&apos;re purchasing your item now — you&apos;ll see the delivery on your{' '}
          <a href="/orders" className="font-medium text-brand hover:underline dark:text-brand-light">orders page</a> shortly.
        </p>
      )}
      {order.status === 'rejected' && (
        <p className="mt-6 rounded bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
          We couldn&apos;t verify your payment. Please contact support.
        </p>
      )}
      {order.status === 'fulfilled' && (
        <div className="mt-6 rounded bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">
          <p className="font-medium">🎁 Delivered!</p>
          <p className="mt-1 whitespace-pre-line">{order.delivered_content}</p>
        </div>
      )}
    </div>
  );
}
