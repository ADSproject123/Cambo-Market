import { notFound } from 'next/navigation';
import { getProductVariants } from '@/lib/db/products';
import { getSessionUser } from '@/lib/auth';
import ProductVariantPicker from '@/components/ProductVariantPicker';

export default async function ProductDetailPage({ params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;
  const [variants, user] = await Promise.all([getProductVariants(offerId), getSessionUser()]);

  if (variants.length === 0) notFound();

  return (
    <div className="mx-auto max-w-4xl py-8">
      {/* Back navigation & Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
          {variants[0].title}
        </h1>
        <p className="mt-3 text-lg text-neutral-500 dark:text-neutral-400">
          Select a plan that fits your needs.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left side / Image Placeholder or description box */}
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 p-8 shadow-inner dark:border-neutral-800 dark:bg-neutral-900/50 lg:col-span-7">
          <div className="absolute inset-0 z-0 opacity-20 mix-blend-color-dodge">
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-brand-light/60 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-brand-dark/60 blur-3xl" />
          </div>
          
          <div className="relative z-10 flex h-64 items-center justify-center">
            {variants[0].image_url ? (
              <div className="flex h-56 w-56 items-center justify-center rounded-[2rem] bg-white p-6 shadow-2xl ring-1 ring-neutral-200/50 dark:ring-white/10">
                <img 
                  src={variants[0].image_url} 
                  alt={variants[0].title} 
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="text-center">
                <span className="text-6xl text-brand drop-shadow-sm">✨</span>
                <h2 className="mt-6 text-xl font-bold text-neutral-900 dark:text-white">Premium Quality</h2>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Instant delivery. 100% verified sellers.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right side / Variant Picker (Interactive area) */}
        <div className="lg:col-span-5">
          <ProductVariantPicker
            variants={variants.map((v) => ({
              offerId: v.offer_id,
              label: v.variant_label,
              basePrice: v.base_price,
              currency: v.currency,
              sellerUsername: v.seller_username,
              sellerVerified: v.seller_verified,
              rating: v.rating,
              availableQty: v.available_qty,
            }))}
            initialOfferId={offerId}
            isSignedIn={!!user}
          />
        </div>
      </div>
    </div>
  );
}
