'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SyncCategoryForm() {
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync(e: React.FormEvent) {
    e.preventDefault();
    if (!category.trim()) return;

    setLoading(true);
    setMessage(null);

    const res = await fetch('/api/admin/products/sync', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ category: category.trim() }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(`❌ ${data.error ?? 'Sync failed.'}`);
      return;
    }
    if (data.synced === 0) {
      setMessage(`⚠️ "${category}" returned 0 listings — check the slug matches a real G2G category URL exactly.`);
    } else {
      setMessage(`✅ Synced ${data.synced} listings for "${category}".`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSync} className="flex flex-wrap items-center gap-2">
      <input
        placeholder="G2G category slug, e.g. notion-accounts"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:border-brand"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-full border border-black px-4 py-1.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
      >
        {loading ? 'Syncing…' : '🔄 Sync category'}
      </button>
      {message && <span className="text-sm text-neutral-600">{message}</span>}
    </form>
  );
}
