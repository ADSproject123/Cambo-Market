import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { config } from '@/lib/config';
import { createAdminClient } from '@/lib/supabase/admin';

function validateTelegramWebAppData(initData: string, botToken: string) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
    
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  return calculatedHash === hash;
}

export async function POST(request: Request) {
  try {
    const { initData } = await request.json();
    if (!initData) {
      return NextResponse.json({ error: 'initData is required' }, { status: 400 });
    }

    // Validate the data
    const isValid = validateTelegramWebAppData(initData, config.botToken);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid initData signature' }, { status: 401 });
    }

    // Extract user info
    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    if (!userStr) {
      return NextResponse.json({ error: 'No user data found' }, { status: 400 });
    }

    const user = JSON.parse(userStr);
    const telegramId = user.id;

    // Upsert user into database
    const db = createAdminClient();
    const { error: dbError } = await db.from('users').upsert(
      {
        telegram_user_id: telegramId,
        username: user.username || null,
        first_name: user.first_name || 'Unknown',
      },
      { onConflict: 'telegram_user_id' }
    );

    if (dbError) {
      console.error('Failed to upsert telegram user:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Generate secure cookie value
    const signature = crypto.createHmac('sha256', config.botToken).update(telegramId.toString()).digest('hex');
    const sessionValue = `${telegramId}.${signature}`;

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('tg_session', sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ success: true, userId: telegramId });
  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
