import { NextResponse } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth';
import { deleteProducts } from '@/lib/db/products';

export async function POST(request: Request) {
  try {
    await requireRole('admin');
    const { offerIds } = (await request.json()) as { offerIds?: unknown };
    if (!Array.isArray(offerIds) || offerIds.some((id) => typeof id !== 'string') || offerIds.length === 0) {
      return NextResponse.json({ error: 'offerIds must be a non-empty string array' }, { status: 400 });
    }
    await deleteProducts(offerIds as string[]);
    return NextResponse.json({ ok: true, deleted: offerIds.length });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
