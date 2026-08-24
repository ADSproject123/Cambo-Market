import { listProducts } from '@/lib/db/products';
import { sellPrice, formatMoney } from '@/lib/pricing';
import SyncButton from '@/components/admin/SyncButton';
import AddProductForm from '@/components/admin/AddProductForm';
import DeleteProductButton from '@/components/admin/DeleteProductButton';

export default async function AdminProductsPage() {
  const products = await listProducts();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <SyncButton category="google-accounts" />
      </div>

      <div className="mb-6">
        <AddProductForm />
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 text-left text-neutral-500">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">G2G price</th>
              <th className="p-3">Sell price</th>
              <th className="p-3">Seller</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.offer_id} className="border-b border-neutral-100 last:border-0">
                <td className="p-3">{p.title}</td>
                <td className="p-3 text-neutral-500">{p.category}</td>
                <td className="p-3">{formatMoney(p.base_price, p.currency)}</td>
                <td className="p-3 font-medium">{formatMoney(sellPrice(p.base_price), p.currency)}</td>
                <td className="p-3 text-neutral-500">{p.seller_username ?? '—'}</td>
                <td className="p-3">
                  <DeleteProductButton offerId={p.offer_id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
