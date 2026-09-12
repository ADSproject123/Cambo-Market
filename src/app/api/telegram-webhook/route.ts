import { NextResponse } from 'next/server';
import { getBot } from '../../../bot/index';
import { logger } from '../../../lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await getBot().handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Error handling Telegram webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
