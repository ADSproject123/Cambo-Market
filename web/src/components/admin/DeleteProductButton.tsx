'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteProductButton({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this product?')) return;
    setLoading(true);
    const res = await fetch(`/api/admin/products/${offerId}`, { method: 'DELETE' });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="text-sm text-red-600 hover:underline disabled:opacity-50">
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  );
}
