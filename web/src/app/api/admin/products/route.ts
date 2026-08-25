import { NextResponse } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth';
import { upsertManualProduct, type ManualProductInput } from '@/lib/db/products';

export async function POST(request: Request) {
  try {
    await requireRole('admin');
    const body = (await request.json()) as ManualProductInput;

    if (!body.title || !body.category || !body.url || typeof body.basePrice !== 'number') {
      return NextResponse.json({ error: 'title, category, url and basePrice are required' }, { status: 400 });
    }

    const product = await upsertManualProduct({
      offerId: body.offerId,
      category: body.category,
      title: body.title,
      basePrice: body.basePrice,
      currency: body.currency || 'USD',
      url: body.url,
      imageUrl: body.imageUrl ?? null,
      variantGroup: body.variantGroup ?? null,
      variantLabel: body.variantLabel ?? null,
    });

    return NextResponse.json({ product });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
