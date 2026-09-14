'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ProductRow } from '@/lib/db/products';
import { sellPrice, formatMoney } from '@/lib/pricing';
import DeleteProductButton from './DeleteProductButton';

export default function ProductsTable({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const visibleIds = useMemo(() => products.map((p) => p.offer_id), [products]);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(visibleIds));
  }

  function toggleOne(offerId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(offerId)) next.delete(offerId);
      else next.add(offerId);
      return next;
    });
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected product(s)?`)) return;

    setDeleting(true);
    const res = await fetch('/api/admin/products/bulk-delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ offerIds: Array.from(selected) }),
    });
    setDeleting(false);

    if (res.ok) {
      setSelected(new Set());
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? 'Bulk delete failed.');
    }
  }

  return (
    <div>
      {someSelected && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 dark:border-red-900/50 dark:bg-red-950/30">
          <span className="text-sm font-medium text-red-700 dark:text-red-400">{selected.size} selected</span>
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete selected'}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-neutral-500 hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-background text-neutral-500">
            <tr>
              <th className="w-10 p-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Variant group / tier</th>
              <th className="p-3">G2G price</th>
              <th className="p-3">Sell price</th>
              <th className="p-3">Seller</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {products.map((p) => (
              <tr
                key={p.offer_id}
                className={`hover:bg-background dark:hover:bg-neutral-800/50 ${selected.has(p.offer_id) ? 'bg-background dark:bg-neutral-800/40' : ''}`}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.offer_id)}
                    onChange={() => toggleOne(p.offer_id)}
                    aria-label={`Select ${p.title}`}
                  />
                </td>
                <td className="p-3 dark:text-white">{p.title}</td>
                <td className="p-3 text-neutral-500">{p.category}</td>
                <td className="p-3 text-neutral-500">
                  {p.variant_group ? `${p.variant_group} · ${p.variant_label ?? '—'}` : '—'}
                </td>
                <td className="p-3 dark:text-neutral-300">{formatMoney(p.base_price, p.currency)}</td>
                <td className="p-3 font-medium dark:text-white">{formatMoney(sellPrice(p.base_price), p.currency)}</td>
                <td className="p-3 text-neutral-500">{p.seller_username ?? '—'}</td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/products/${p.offer_id}/edit`} className="text-sm text-brand hover:underline">
                      Edit
                    </Link>
                    <DeleteProductButton offerId={p.offer_id} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-neutral-500">
                  No products match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
