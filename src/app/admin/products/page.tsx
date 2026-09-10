import Link from 'next/link';
import { listProducts } from '@/lib/db/products';
import { sellPrice, formatMoney } from '@/lib/pricing';
import SyncCategoryForm from '@/components/admin/SyncCategoryForm';
import AddProductForm from '@/components/admin/AddProductForm';
import DeleteProductButton from '@/components/admin/DeleteProductButton';

export default async function AdminProductsPage() {
  const products = await listProducts();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold dark:text-white">Products</h1>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SyncCategoryForm />
        <AddProductForm />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background text-neutral-500">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Variant group / tier</th>
              <th className="p-3">G2G price</th>
              <th className="p-3">Sell price</th>
              <th className="p-3">Seller</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {products.map((p) => (
              <tr key={p.offer_id} className="hover:bg-background dark:hover:bg-neutral-800/50">
                <td className="p-3 dark:text-white">{p.title}</td>
                <td className="p-3 text-neutral-500">{p.category}</td>
                <td className="p-3 text-neutral-500">
                  {p.variant_group ? `${p.variant_group} · ${p.variant_label ?? '—'}` : '—'}
                </td>
                <td className="p-3 dark:text-neutral-300">{formatMoney(p.base_price, p.currency)}</td>
                <td className="p-3 font-medium dark:text-white">{formatMoney(sellPrice(p.base_price), p.currency)}</td>
                <td className="p-3 text-neutral-500">{p.seller_username ?? '—'}</td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/products/${p.offer_id}/edit`} className="text-sm text-brand hover:underline">
                      Edit
                    </Link>
                    <DeleteProductButton offerId={p.offer_id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
