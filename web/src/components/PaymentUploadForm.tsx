'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentUploadForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const form = new FormData();
    form.set('screenshot', file);

    const res = await fetch(`/api/orders/${orderId}/payment`, { method: 'POST', body: form });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Upload failed.');
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
      <input
        type="file"
        accept="image/*"
        required
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !file}
        className="w-fit rounded-full bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
      >
        {loading ? 'Uploading…' : 'Upload payment proof'}
      </button>
    </form>
  );
}
