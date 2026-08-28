import Link from 'next/link';
import { listCategories } from '@/lib/db/products';
import { sellPrice, formatMoney } from '@/lib/pricing';
import { formatCategoryName } from '@/lib/format';
import { SearchBar } from '@/components/SearchBar';
import { CategorySelector } from '@/components/CategorySelector';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  
  const minPrice = resolvedParams.minPrice ? Number(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? Number(resolvedParams.maxPrice) : undefined;
  const verifiedOnly = resolvedParams.verified === 'true';

  const categories = await listCategories({
    minPrice,
    maxPrice,
    verifiedOnly
  });

  return (
    <div className="flex flex-col gap-8 sm:gap-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-neutral-900 px-6 py-16 text-center shadow-2xl sm:px-12 sm:py-24">
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0 opacity-30 mix-blend-color-dodge">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-light/40 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand-dark/40 blur-3xl" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-2xl">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            Premium Digital Products, <span className="text-brand-light">Delivered Instantly.</span>
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-neutral-300 sm:text-xl text-balance">
            Browse our curated catalog of high-quality digital assets. Fully verified, incredibly cheap, and securely delivered.
          </p>
        </div>
      </section>

      {/* Global Search and Category Selector */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
        <div className="w-full sm:w-[400px]">
          <SearchBar />
        </div>
        <CategorySelector categories={categories.map(c => c.category)} />
      </section>

      {/* Categories Grid */}
      <section>
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Explore Catalog</h2>
        </div>
        
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 py-24 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
            <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400">No listings available right now</p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">Please check back shortly as we sync our catalog.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c, i) => (
              <Link
                key={c.category}
                href={`/categories/${c.category}`}
                style={{ animationDelay: `${i * 100}ms` }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-light hover:shadow-xl hover:shadow-brand/5 animate-[fade-in-up_0.6s_ease-out_both] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand-dark"
              >
                {/* Subtle gradient hover effect inside the card */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-light/0 to-brand-light/0 transition-all duration-500 group-hover:from-brand-light/5 group-hover:to-transparent" />
                
                <div className="relative z-10">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-50 p-3 shadow-sm ring-1 ring-neutral-200/50 transition-transform duration-300 group-hover:scale-110 dark:bg-white dark:ring-white/20">
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt={c.category} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-3xl">✨</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 transition-colors group-hover:text-brand-dark dark:text-neutral-100 dark:group-hover:text-brand-light">{formatCategoryName(c.category)}</h3>
                  <p className="mt-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">{c.count} listing{c.count === 1 ? '' : 's'}</p>
                </div>
                
                <div className="relative z-10 mt-6 flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Starting at</p>
                  <p className="text-lg font-bold text-brand">
                    {formatMoney(sellPrice(c.cheapestPrice), c.currency)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
