import { NextResponse } from 'next/server';
import { requireRole, AuthError } from '@/lib/auth';
import { fetchG2GCategoryOffers } from '@/lib/scrapers/g2gCatalog';
import { upsertScrapedProducts } from '@/lib/db/products';

export async function POST(request: Request) {
  try {
    await requireRole('admin');
    const { category } = (await request.json()) as { category?: string };
    if (!category) return NextResponse.json({ error: 'category is required' }, { status: 400 });

    const offers = await fetchG2GCategoryOffers(category);
    await upsertScrapedProducts(category, offers);

    return NextResponse.json({ synced: offers.length });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
