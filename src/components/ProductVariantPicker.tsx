'use client';

import { useState } from 'react';
import { sellPrice, formatMoney } from '@/lib/pricing';
import BuyButton from './BuyButton';
import { CheckCircle2, Star, ShieldCheck, Box } from 'lucide-react';

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
    <div className="flex flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
      {/* Price Header */}
      <div>
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Price</p>
        <p className="mt-1 flex items-baseline gap-2 text-4xl font-extrabold text-brand dark:text-brand-light">
          {formatMoney(sellPrice(selected.basePrice), selected.currency)}
        </p>
      </div>

      {/* Variants Selection */}
      {variants.length > 1 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">Choose your plan</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {variants.map((v, i) => {
              const isSelected = v.offerId === selectedId;
              return (
                <button
                  key={v.offerId}
                  onClick={() => setSelectedId(v.offerId)}
                  className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 p-3 text-center transition-all ${
                    isSelected
                      ? 'border-brand bg-brand/5 shadow-md dark:border-brand dark:bg-brand/10'
                      : 'border-neutral-200 bg-white hover:border-brand-light hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-brand">
                      <CheckCircle2 size={16} className="fill-brand/20" />
                    </div>
                  )}
                  <span className={`text-sm font-bold ${isSelected ? 'text-brand' : 'text-neutral-700 dark:text-neutral-300'}`}>
                    {v.label || `Option ${i + 1}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Details Box */}
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900/50">
        <ul className="space-y-4">
          <li className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-800">
              <ShieldCheck size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Seller</p>
              <p className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-1">
                {selected.sellerUsername}
                {selected.sellerVerified && (
                  <span title="Verified Seller" className="text-emerald-500">
                    <CheckCircle2 size={16} />
                  </span>
                )}
              </p>
            </div>
          </li>
          
          {selected.rating !== null && (
            <li className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-800">
                <Star size={20} className="text-amber-400 fill-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Rating</p>
                <p className="text-base font-semibold text-neutral-900 dark:text-white">{selected.rating} / 5</p>
              </div>
            </li>
          )}

          {selected.availableQty > 0 && (
            <li className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-800">
                <Box size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Stock Availability</p>
                <p className="text-base font-semibold text-neutral-900 dark:text-white">{selected.availableQty} units left</p>
              </div>
            </li>
          )}
        </ul>
      </div>

      {/* Action Button */}
      <div className="mt-2">
        <BuyButton key={selected.offerId} offerId={selected.offerId} isSignedIn={isSignedIn} />
      </div>
    </div>
  );
}
