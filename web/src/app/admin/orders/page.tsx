import { listAllOrders } from '@/lib/db/orders';
import { formatMoney } from '@/lib/pricing';
import { ApproveRejectButtons, DeliverForm } from '@/components/admin/OrderActions';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  needs_quote: 'Needs quote',
  awaiting_payment: '⏳ Awaiting payment',
  pending_review: '🧾 Pending review',
  approved: '✅ Approved',
  rejected: '❌ Rejected',
  fulfilled: '🎁 Fulfilled',
  cancelled: '✖️ Cancelled',
};

export default async function AdminOrdersPage() {
  const orders = await listAllOrders();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Orders</h1>
      <div className="flex flex-col gap-4">
        {orders.map((o) => (
          <div key={o.id} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{o.product_title ?? o.product_url}</p>
                <p className="text-sm text-neutral-500">
                  {o.telegram_user_id ? `Telegram #${o.telegram_user_id}` : 'Web buyer'} ·{' '}
                  {STATUS_LABELS[o.status] ?? o.status} · {formatMoney(o.total_amount ?? 0, o.currency)}
                </p>
              </div>
            </div>

            {(o.payment_screenshot_url || o.payment_screenshot_file_id) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/admin/orders/${o.id}/screenshot`}
                alt="Payment proof"
                className="mt-3 max-h-64 rounded border border-neutral-200"
              />
            )}

            {o.status === 'pending_review' && (
              <div className="mt-3">
                <ApproveRejectButtons orderId={o.id} />
              </div>
            )}
            {o.status === 'approved' && (
              <div className="mt-3">
                <DeliverForm orderId={o.id} />
              </div>
            )}
            {o.status === 'fulfilled' && o.delivered_content && (
              <p className="mt-3 whitespace-pre-line rounded bg-green-50 p-2 text-sm text-green-800">
                {o.delivered_content}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
