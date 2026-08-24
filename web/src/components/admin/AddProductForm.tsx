'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProductForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ category: '', title: '', basePrice: '', url: '', imageUrl: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        category: form.category,
        title: form.title,
        basePrice: Number(form.basePrice),
        currency: 'USD',
        url: form.url,
        imageUrl: form.imageUrl || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Failed to add product.');
      return;
    }
    setForm({ category: '', title: '', basePrice: '', url: '', imageUrl: '' });
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded border border-neutral-300 px-3 py-1.5 text-sm">
        + Add product
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4">
      <input
        required
        placeholder="Category slug (e.g. google-accounts)"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        className="rounded border border-neutral-300 px-2 py-1 text-sm"
      />
      <input
        required
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="rounded border border-neutral-300 px-2 py-1 text-sm"
      />
      <input
        required
        type="number"
        step="0.01"
        placeholder="Base price (USD)"
        value={form.basePrice}
        onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
        className="rounded border border-neutral-300 px-2 py-1 text-sm"
      />
      <input
        required
        placeholder="Product URL"
        value={form.url}
        onChange={(e) => setForm({ ...form, url: e.target.value })}
        className="rounded border border-neutral-300 px-2 py-1 text-sm"
      />
      <input
        placeholder="Image URL (optional)"
        value={form.imageUrl}
        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        className="rounded border border-neutral-300 px-2 py-1 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {loading ? 'Adding…' : 'Add'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded border border-neutral-300 px-3 py-1.5 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
