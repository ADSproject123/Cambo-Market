'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from './ProductForm';

export default function AddProductForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-black px-4 py-1.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
      >
        + Add product
      </button>
    );
  }

  return (
    <ProductForm
      onSaved={() => {
        setOpen(false);
        router.refresh();
      }}
      onCancel={() => setOpen(false)}
    />
  );
}
