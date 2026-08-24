'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SyncButton({ category }: { category: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setLoading(true);
    setMessage(null);

    const res = await fetch('/api/admin/products/sync', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ category }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(`❌ ${data.error ?? 'Sync failed.'}`);
      return;
    }
    setMessage(`✅ Synced ${data.synced} listings.`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={loading}
        className="rounded border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {loading ? 'Syncing…' : `🔄 Sync ${category}`}
      </button>
      {message && <span className="text-sm text-neutral-600">{message}</span>}
    </div>
  );
}
