import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { listOrdersForUser } from '@/lib/db/orders';
import { formatMoney } from '@/lib/pricing';

const STATUS_LABELS: Record<string, string> = {
  awaiting_payment: '⏳ Awaiting payment',
  pending_review: '🧾 Reviewing payment',
  approved: '✅ Approved — purchasing',
  rejected: '❌ Rejected',
  fulfilled: '🎁 Fulfilled',
  cancelled: '✖️ Cancelled',
};

export default async function OrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  const orders = await listOrdersForUser(user.id);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">My orders</h1>
      {orders.length === 0 ? (
        <p className="text-neutral-500">
          No orders yet — <Link href="/" className="underline">browse listings</Link>.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/checkout/${o.id}`}
              className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{o.product_title}</p>
                <p className="font-semibold">{formatMoney(o.total_amount ?? 0, o.currency)}</p>
              </div>
              <p className="mt-1 text-sm text-neutral-500">{STATUS_LABELS[o.status] ?? o.status}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
