import { notFound } from 'next/navigation';
import { getProductVariants } from '@/lib/db/products';
import { getSessionUser } from '@/lib/auth';
import ProductVariantPicker from '@/components/ProductVariantPicker';

export default async function ProductDetailPage({ params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;
  const [variants, user] = await Promise.all([getProductVariants(offerId), getSessionUser()]);

  if (variants.length === 0) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold">{variants[0].title}</h1>
      <div className="mt-2">
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
  );
}
