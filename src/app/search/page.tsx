import Link from 'next/link';
import { listProducts } from '@/lib/db/products';
import { groupProductsForDisplay } from '@/lib/productGrouping';
import { sellPrice, formatMoney } from '@/lib/pricing';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';

  if (!q) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 py-24 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
        <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400">Please enter a search query.</p>
      </div>
    );
  }

  const products = await listProducts({ searchQuery: q });
  const groups = groupProductsForDisplay(products);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold dark:text-white">Search results for "{q}"</h1>
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 py-24 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
          <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400">No products found matching "{q}"</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, i) => (
            <Link
              key={g.representativeOfferId}
              href={`/products/${g.representativeOfferId}`}
              style={{ animationDelay: `${i * 100}ms` }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-light hover:shadow-xl hover:shadow-brand/5 animate-[fade-in-up_0.6s_ease-out_both] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand-dark"
            >
              {/* Subtle gradient hover effect inside the card */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-light/0 to-brand-light/0 transition-all duration-500 group-hover:from-brand-light/5 group-hover:to-transparent" />
              
              <div className="relative z-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-50 p-2 shadow-sm dark:bg-neutral-800/50">
                  {g.imageUrl ? (
                    <img src={g.imageUrl} alt={g.title} className="h-full w-full object-contain drop-shadow-sm" />
                  ) : (
                    <span className="text-2xl">✨</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 transition-colors group-hover:text-brand-dark dark:text-neutral-100 dark:group-hover:text-brand-light">{g.title}</h3>
                <p className="mt-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {g.variantCount > 1
                    ? `${g.variantCount} plans available`
                    : `${g.sellerUsername ?? 'Seller'}${g.sellerVerified ? ' ✅' : ''}${g.rating !== null ? ` · ${g.rating}★` : ''}`}
                </p>
              </div>
              
              <div className="relative z-10 mt-6 flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Starting at</p>
                <p className="text-lg font-bold text-brand">
                  {formatMoney(sellPrice(g.cheapestPrice), g.currency)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
