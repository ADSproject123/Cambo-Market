import { supabase } from './supabase.js';
import type { Marketplace, OrderRow, OrderStatus } from './types.js';

export interface CreateOrderInput {
  telegramUserId: number;
  marketplace: Marketplace;
  productUrl: string;
  productTitle: string | null;
  scrapedPrice: number | null;
  currency: string;
  serviceFeePercent: number;
  totalAmount: number | null;
  status: OrderStatus;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderRow> {
  const { data, error } = await supabase
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

export async function getOrder(id: string): Promise<OrderRow | null> {
  const { data, error } = await supabase.from('orders').select().eq('id', id).maybeSingle();
  if (error) throw error;
  return data as OrderRow | null;
}

export async function updateOrder(id: string, patch: Partial<OrderRow>): Promise<OrderRow> {
  const { data, error } = await supabase.from('orders').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data as OrderRow;
}

export async function findLatestOrderByUserAndStatus(
  telegramUserId: number,
  statuses: OrderStatus[],
): Promise<OrderRow | null> {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from('orders')
    .select()
    .eq('admin_notify_chat_id', adminChatId)
    .eq('admin_notify_message_id', adminMessageId)
    .maybeSingle();

  if (error) throw error;
  return data as OrderRow | null;
}
