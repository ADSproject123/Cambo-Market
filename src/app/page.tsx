import Link from 'next/link';
import { listCategories } from '@/lib/db/products';
import { sellPrice, formatMoney } from '@/lib/pricing';
import { formatCategoryName } from '@/lib/format';

export default async function HomePage() {
  const categories = await listCategories();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Shop by category</h1>
      {categories.length === 0 ? (
        <p className="text-neutral-500">No listings available right now — please check back shortly.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.category}
              href={`/categories/${c.category}`}
              className="rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-brand"
            >
              <p className="text-lg font-semibold">{formatCategoryName(c.category)}</p>
              <p className="mt-1 text-sm text-neutral-500">{c.count} listing{c.count === 1 ? '' : 's'}</p>
              <p className="mt-2 font-bold text-brand">
                from {formatMoney(sellPrice(c.cheapestPrice), c.currency)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
