import { createAdminClient } from '../supabase/admin';

export type OrderStatus =
  | 'draft'
  | 'needs_quote'
  | 'awaiting_payment'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'fulfilled'
  | 'cancelled';

export interface OrderRow {
  id: string;
  telegram_user_id: number | null;
  web_user_id: string | null;
  marketplace: 'g2a' | 'g2g';
  product_url: string;
  product_title: string | null;
  scraped_price: number | null;
  currency: string;
  service_fee_percent: number;
  total_amount: number | null;
  status: OrderStatus;
  payment_screenshot_file_id: string | null;
  payment_screenshot_url: string | null;
  admin_notify_chat_id: number | null;
  admin_notify_message_id: number | null;
  admin_note: string | null;
  delivered_content: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWebOrderInput {
  webUserId: string;
  productOfferId: string;
  productUrl: string;
  productTitle: string;
  basePrice: number;
  currency: string;
  totalAmount: number;
}

export async function createWebOrder(input: CreateWebOrderInput): Promise<OrderRow> {
  const db = createAdminClient();
  const isTgUser = input.webUserId.startsWith('tg_');
  
  const { data, error } = await db
    .from('orders')
    .insert({
      web_user_id: isTgUser ? null : input.webUserId,
      telegram_user_id: isTgUser ? parseInt(input.webUserId.slice(3), 10) : null,
      marketplace: 'g2g',
      product_url: input.productUrl,
      product_title: input.productTitle,
      scraped_price: input.basePrice,
      currency: input.currency,
      service_fee_percent: 0,
      total_amount: input.totalAmount,
      status: 'awaiting_payment',
    })
    .select()
    .single();

  if (error) throw error;
  return data as OrderRow;
}

export async function getOrder(id: string): Promise<OrderRow | null> {
  const db = createAdminClient();
  const { data, error } = await db.from('orders').select().eq('id', id).maybeSingle();
  if (error) throw error;
  return data as OrderRow | null;
}

export async function listOrdersForUser(webUserId: string): Promise<OrderRow[]> {
  const db = createAdminClient();
  const isTgUser = webUserId.startsWith('tg_');
  
  let query = db.from('orders').select().order('created_at', { ascending: false });
  
  if (isTgUser) {
    query = query.eq('telegram_user_id', parseInt(webUserId.slice(3), 10));
  } else {
    query = query.eq('web_user_id', webUserId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as OrderRow[]) ?? [];
}

export async function listAllOrders(statuses?: OrderStatus[]): Promise<OrderRow[]> {
  const db = createAdminClient();
  let query = db.from('orders').select().order('created_at', { ascending: false });
  if (statuses?.length) query = query.in('status', statuses);
  const { data, error } = await query;
  if (error) throw error;
  return (data as OrderRow[]) ?? [];
}

export async function updateOrder(id: string, patch: Partial<OrderRow>): Promise<OrderRow> {
  const db = createAdminClient();
  const { data, error } = await db.from('orders').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as OrderRow;
}

export interface CreateOrderInput {
  telegramUserId: number;
  marketplace: 'g2a' | 'g2g';
  productUrl: string;
  productTitle: string | null;
  scrapedPrice: number | null;
  currency: string;
  serviceFeePercent: number;
  totalAmount: number | null;
  status: OrderStatus;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderRow> {
  const db = createAdminClient();
  const { data, error } = await db
    .from('orders')
    .insert({
      telegram_user_id: input.telegramUserId,
      marketplace: input.marketplace,
      product_url: input.productUrl,
      product_title: input.productTitle,
      scraped_price: input.scrapedPrice,
      currency: input.currency,
      service_fee_percent: input.serviceFeePercent,
      total_amount: input.totalAmount,
      status: input.status,
    })
    .select()
    .single();

  if (error) throw error;
  return data as OrderRow;
}

export async function findLatestOrderByUserAndStatus(
  telegramUserId: number,
  statuses: OrderStatus[],
): Promise<OrderRow | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from('orders')
    .select()
    .eq('telegram_user_id', telegramUserId)
    .in('status', statuses)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as OrderRow | null;
}

export async function findOrderByAdminMessage(
  adminChatId: number,
  adminMessageId: number,
): Promise<OrderRow | null> {
  const db = createAdminClient();
  const { data, error } = await db
    .from('orders')
    .select()
    .eq('admin_notify_chat_id', adminChatId)
    .eq('admin_notify_message_id', adminMessageId)
    .maybeSingle();

  if (error) throw error;
  return data as OrderRow | null;
}
