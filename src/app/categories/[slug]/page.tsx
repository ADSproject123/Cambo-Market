import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listProducts } from '@/lib/db/products';
import { groupProductsForDisplay } from '@/lib/productGrouping';
import { sellPrice, formatMoney } from '@/lib/pricing';
import { formatCategoryName } from '@/lib/format';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await listProducts(slug);

  if (products.length === 0) notFound();

  const groups = groupProductsForDisplay(products);

  return (
    <div>
      <Link href="/" className="text-sm text-neutral-500 hover:text-brand">
        ← All categories
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">{formatCategoryName(slug)}</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((g) => (
          <Link
            key={g.representativeOfferId}
            href={`/products/${g.representativeOfferId}`}
            className="rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-brand"
          >
            <p className="font-medium">{g.title}</p>
            <p className="mt-2 text-lg font-bold">
              {g.variantCount > 1 ? 'from ' : ''}
              {formatMoney(sellPrice(g.cheapestPrice), g.currency)}
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              {g.variantCount > 1
                ? `${g.variantCount} plans available`
                : `${g.sellerUsername ?? ''}${g.sellerVerified ? ' ✅' : ''}${g.rating !== null ? ` · ${g.rating}★` : ''}`}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
