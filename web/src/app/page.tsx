import Link from 'next/link';
import { listProducts } from '@/lib/db/products';
import { sellPrice, formatMoney } from '@/lib/pricing';

export default async function HomePage() {
  const products = await listProducts();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Google Accounts</h1>
      {products.length === 0 ? (
        <p className="text-neutral-500">No listings available right now — please check back shortly.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <Link
              key={p.offer_id}
              href={`/products/${p.offer_id}`}
              className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400"
            >
              <p className="font-medium">{p.title}</p>
              <p className="mt-2 text-lg font-semibold">{formatMoney(sellPrice(p.base_price), p.currency)}</p>
              <p className="mt-1 text-sm text-neutral-500">
                {p.seller_username}
                {p.seller_verified ? ' ✅' : ''}
                {p.rating !== null ? ` · ${p.rating}★` : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
