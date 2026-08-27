'use client';

import { useState } from 'react';
import { sellPrice, formatMoney } from '@/lib/pricing';
import BuyButton from './BuyButton';

export interface VariantOption {
  offerId: string;
  label: string | null;
  basePrice: number;
  currency: string;
  sellerUsername: string | null;
  sellerVerified: boolean;
  rating: number | null;
  availableQty: number;
}

export default function ProductVariantPicker({
  variants,
  initialOfferId,
  isSignedIn,
}: {
  variants: VariantOption[];
  initialOfferId: string;
  isSignedIn: boolean;
}) {
  const [selectedId, setSelectedId] = useState(initialOfferId);
  const selected = variants.find((v) => v.offerId === selectedId) ?? variants[0];

  return (
    <div>
      {variants.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {variants.map((v, i) => (
            <button
              key={v.offerId}
              onClick={() => setSelectedId(v.offerId)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                v.offerId === selectedId
                  ? 'border-brand bg-brand text-white'
                  : 'border-neutral-300 text-neutral-700 hover:border-brand hover:text-brand'
              }`}
            >
              {v.label || `Option ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <p className="text-2xl font-bold">{formatMoney(sellPrice(selected.basePrice), selected.currency)}</p>

      <dl className="mt-4 space-y-1 text-sm text-neutral-600">
        <div>
          <dt className="inline font-medium">Seller: </dt>
          <dd className="inline">
            {selected.sellerUsername}
            {selected.sellerVerified ? ' ✅' : ''}
          </dd>
        </div>
        {selected.rating !== null && (
          <div>
            <dt className="inline font-medium">Rating: </dt>
            <dd className="inline">{selected.rating}★</dd>
          </div>
        )}
        {selected.availableQty > 0 && (
          <div>
            <dt className="inline font-medium">Available: </dt>
            <dd className="inline">{selected.availableQty}</dd>
          </div>
        )}
      </dl>

      <div className="mt-6">
        <BuyButton key={selected.offerId} offerId={selected.offerId} isSignedIn={isSignedIn} />
      </div>
    </div>
  );
}
