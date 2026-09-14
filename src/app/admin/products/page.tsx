import { listProducts, listDistinctCategories } from '@/lib/db/products';
import SyncCategoryForm from '@/components/admin/SyncCategoryForm';
import AddProductForm from '@/components/admin/AddProductForm';
import G2GAuthScrapeButton from '@/components/admin/G2GAuthScrapeButton';
import ProductsFilterBar from '@/components/admin/ProductsFilterBar';
import ProductsTable from '@/components/admin/ProductsTable';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category = '', q = '' } = await searchParams;

  const [products, categories] = await Promise.all([
    listProducts({ category: category || undefined, searchQuery: q || undefined }),
    listDistinctCategories(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold dark:text-white">Products</h1>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SyncCategoryForm />
        <AddProductForm />
      </div>

      <div className="mb-6">
        <G2GAuthScrapeButton />
      </div>

      <ProductsFilterBar categories={categories} currentCategory={category} currentSearch={q} />

      <ProductsTable products={products} />
    </div>
  );
}
