import { NextResponse } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth';
import { deleteProduct } from '@/lib/db/products';

export async function DELETE(_request: Request, { params }: { params: Promise<{ offerId: string }> }) {
  try {
    await requireRole('admin');
    const { offerId } = await params;
    await deleteProduct(offerId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
