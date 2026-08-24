import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/db/products';
import { sellPrice, formatMoney } from '@/lib/pricing';
import { getSessionUser } from '@/lib/auth';
import BuyButton from '@/components/BuyButton';

export default async function ProductDetailPage({ params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;
  const [product, user] = await Promise.all([getProduct(offerId), getSessionUser()]);

  if (!product) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold">{product.title}</h1>
      <p className="mt-2 text-2xl font-bold">{formatMoney(sellPrice(product.base_price), product.currency)}</p>
      <dl className="mt-4 space-y-1 text-sm text-neutral-600">
        <div>
          <dt className="inline font-medium">Seller: </dt>
          <dd className="inline">
            {product.seller_username}
            {product.seller_verified ? ' ✅' : ''}
          </dd>
        </div>
        {product.rating !== null && (
          <div>
            <dt className="inline font-medium">Rating: </dt>
            <dd className="inline">{product.rating}★</dd>
          </div>
        )}
        {product.available_qty > 0 && (
          <div>
            <dt className="inline font-medium">Available: </dt>
            <dd className="inline">{product.available_qty}</dd>
          </div>
        )}
      </dl>
      <div className="mt-6">
        <BuyButton offerId={product.offer_id} isSignedIn={!!user} />
      </div>
    </div>
  );
}
