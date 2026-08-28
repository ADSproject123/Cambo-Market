import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listProducts } from '@/lib/db/products';
import { groupProductsForDisplay } from '@/lib/productGrouping';
import { sellPrice, formatMoney } from '@/lib/pricing';
import { formatCategoryName } from '@/lib/format';
import { CategoryFilters } from '@/components/CategoryFilters';
import { SearchBar } from '@/components/SearchBar';

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { slug } = await params;
  const resolvedParams = await searchParams;
  
  const minPrice = resolvedParams.minPrice ? Number(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? Number(resolvedParams.maxPrice) : undefined;
  const verifiedOnly = resolvedParams.verified === 'true';

  const products = await listProducts({ 
    category: slug,
    minPrice,
    maxPrice,
    verifiedOnly
  });

  if (products.length === 0 && !minPrice && !maxPrice && !verifiedOnly) notFound();

  const groups = groupProductsForDisplay(products);

  return (
    <div>
      <Link href="/" className="text-sm text-neutral-500 hover:text-brand dark:text-neutral-400">
        ← All categories
      </Link>
      <div className="mb-6 mt-2 flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white">{formatCategoryName(slug)}</h1>
      </div>
      
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
        <div className="w-full sm:w-[400px]">
          <SearchBar />
        </div>
        <CategoryFilters />
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 py-24 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
          <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400">No products match your filters.</p>
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
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-50 p-3 shadow-sm transition-transform duration-300 group-hover:scale-110 dark:bg-neutral-800/50">
                {g.imageUrl ? (
                  <img src={g.imageUrl} alt={g.title} className="h-full w-full object-contain drop-shadow-sm" />
                ) : (
                  <span className="text-3xl">✨</span>
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
