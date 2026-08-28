'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductRow } from '@/lib/db/products';

export default function ProductForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: ProductRow;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    category: initial?.category ?? '',
    title: initial?.title ?? '',
    basePrice: initial ? String(initial.base_price) : '',
    url: initial?.url ?? '',
    imageUrl: initial?.image_url ?? '',
    variantGroup: initial?.variant_group ?? '',
    variantLabel: initial?.variant_label ?? '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        offerId: initial?.offer_id,
        category: form.category,
        title: form.title,
        basePrice: Number(form.basePrice),
        currency: initial?.currency ?? 'USD',
        url: form.url,
        imageUrl: form.imageUrl || undefined,
        variantGroup: form.variantGroup || undefined,
        variantLabel: form.variantLabel || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Failed to save product.');
      return;
    }
    if (onSaved) {
      onSaved();
    } else {
      router.push('/admin/products');
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <input
        required
        placeholder="Category slug (e.g. google-accounts)"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        className="rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:border-brand"
      />
      <input
        required
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:border-brand"
      />
      <input
        required
        type="number"
        step="0.01"
        placeholder="Base price (USD)"
        value={form.basePrice}
        onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
        className="rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:border-brand"
      />
      <input
        required
        placeholder="Product URL"
        value={form.url}
        onChange={(e) => setForm({ ...form, url: e.target.value })}
        className="rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:border-brand"
      />
      <input
        placeholder="Image URL (optional)"
        value={form.imageUrl}
        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        className="rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:border-brand"
      />

      <div className="mt-2 border-t border-neutral-200 pt-2">
        <p className="mb-2 text-xs font-medium text-neutral-500">
          Price tiers (optional) — give two or more products the same group key to show them as one
          card with a plan selector, e.g. &ldquo;notion-business&rdquo; for both a 1-month and 3-month listing.
        </p>
        <div className="flex gap-2">
          <input
            placeholder="Variant group key (optional)"
            value={form.variantGroup}
            onChange={(e) => setForm({ ...form, variantGroup: e.target.value })}
            className="flex-1 rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:border-brand"
          />
          <input
            placeholder='Tier label (e.g. "1 Month")'
            value={form.variantLabel}
            onChange={(e) => setForm({ ...form, variantLabel: e.target.value })}
            className="flex-1 rounded-lg border border-neutral-300 px-2 py-1 text-sm focus:border-brand"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand disabled:opacity-50"
        >
          {loading ? 'Saving…' : initial ? 'Save changes' : 'Add'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
