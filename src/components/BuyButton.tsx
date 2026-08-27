'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyButton({ offerId, isSignedIn }: { offerId: string; isSignedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    if (!isSignedIn) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ offerId }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.');
      return;
    }
    router.push(`/checkout/${data.orderId}`);
  }

  return (
    <div>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="rounded-full bg-brand px-5 py-2.5 font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
      >
        {loading ? 'Starting order…' : isSignedIn ? '✅ Buy' : 'Log in to buy'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
