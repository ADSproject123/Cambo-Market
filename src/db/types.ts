export type Marketplace = 'g2a' | 'g2g';

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
  telegram_user_id: number;
  marketplace: Marketplace;
  product_url: string;
  product_title: string | null;
  scraped_price: number | null;
  currency: string;
  service_fee_percent: number;
  total_amount: number | null;
  status: OrderStatus;
  payment_screenshot_file_id: string | null;
  admin_notify_chat_id: number | null;
  admin_notify_message_id: number | null;
  admin_note: string | null;
  delivered_content: string | null;
  created_at: string;
  updated_at: string;
}
