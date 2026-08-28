import Link from 'next/link';
import { listAllOrders } from '@/lib/db/orders';
import { listProducts } from '@/lib/db/products';

export default async function AdminDashboardPage() {
  const [pending, products] = await Promise.all([listAllOrders(['pending_review']), listProducts()]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/orders"
          className="rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-brand dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand-dark"
        >
          <p className="text-2xl font-bold text-brand">{pending.length}</p>
          <p className="text-sm text-neutral-500">Orders awaiting review</p>
        </Link>
        <Link
          href="/admin/products"
          className="rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-brand dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand-dark"
        >
          <p className="text-2xl font-bold text-brand">{products.length}</p>
          <p className="text-sm text-neutral-500">Listed products</p>
        </Link>
      </div>
    </div>
  );
}
