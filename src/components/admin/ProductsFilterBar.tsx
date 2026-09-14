export default function ProductsFilterBar({
  categories,
  currentCategory,
  currentSearch,
}: {
  categories: string[];
  currentCategory: string;
  currentSearch: string;
}) {
  const hasFilters = Boolean(currentCategory || currentSearch);

  return (
    <form method="GET" className="mb-4 flex flex-wrap items-center gap-2">
      <input
        type="text"
        name="q"
        placeholder="Search title…"
        defaultValue={currentSearch}
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:border-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
      />
      <select
        name="category"
        defaultValue={currentCategory}
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:border-brand dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-full border border-black px-4 py-1.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand dark:border-white dark:text-white"
      >
        Filter
      </button>
      {hasFilters && (
        <a href="/admin/products" className="text-sm text-neutral-500 hover:underline">
          Clear filters
        </a>
      )}
    </form>
  );
}
