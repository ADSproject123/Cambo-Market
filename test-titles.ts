// A script to see titles
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
  const { data } = await db.from('products').select('category, title');
  if (data) {
    const cats = [...new Set(data.map(r => r.category))];
    console.log('Categories:', cats);
    console.log('Sample titles:', data.map(d => d.title).slice(0, 20));
  }
}
run();
