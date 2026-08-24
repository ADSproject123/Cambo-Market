import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listProducts } from '@/lib/db/products';
import { sellPrice, formatMoney } from '@/lib/pricing';
import { formatCategoryName } from '@/lib/format';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await listProducts(slug);

  if (products.length === 0) notFound();

  return (
    <div>
      <Link href="/" className="text-sm text-neutral-500 hover:text-brand">
        ← All categories
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">{formatCategoryName(slug)}</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((p) => (
          <Link
            key={p.offer_id}
            href={`/products/${p.offer_id}`}
            className="rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-brand"
          >
            <p className="font-medium">{p.title}</p>
            <p className="mt-2 text-lg font-bold">{formatMoney(sellPrice(p.base_price), p.currency)}</p>
            <p className="mt-1 text-sm text-neutral-500">
              {p.seller_username}
              {p.seller_verified ? ' ✅' : ''}
              {p.rating !== null ? ` · ${p.rating}★` : ''}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
