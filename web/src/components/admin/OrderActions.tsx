'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

async function postJson(url: string, body?: unknown) {
  return fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function ApproveRejectButtons({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);

  async function act(action: 'approve' | 'reject') {
    setLoading(action);
    const res = await postJson(`/api/admin/orders/${orderId}/${action}`);
    setLoading(null);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => act('approve')}
        disabled={loading !== null}
        className="rounded bg-green-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {loading === 'approve' ? 'Approving…' : '✅ Approve'}
      </button>
      <button
        onClick={() => act('reject')}
        disabled={loading !== null}
        className="rounded bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {loading === 'reject' ? 'Rejecting…' : '❌ Reject'}
      </button>
    </div>
  );
}

export function DeliverForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await postJson(`/api/admin/orders/${orderId}/deliver`, { content });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to deliver.');
      return;
    }
    setContent('');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        required
        placeholder="Key / account details to deliver to the buyer"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="rounded border border-neutral-300 px-2 py-1 text-sm"
        rows={2}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-fit rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {loading ? 'Delivering…' : '🎁 Mark fulfilled & deliver'}
      </button>
    </form>
  );
}
