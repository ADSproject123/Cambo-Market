import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/db/products';
import ProductForm from '@/components/admin/ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;
  const product = await getProduct(offerId);
  if (!product) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="mb-4 text-2xl font-bold">Edit product</h1>
      <ProductForm initial={product} />
    </div>
  );
}
