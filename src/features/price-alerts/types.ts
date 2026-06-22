export interface AlertProduct {
  url: string;
  name: string;
  price: number;
}

export interface SubscribeResult {
  ok: boolean;
  deduped?: boolean;
}

export interface PriceAlert {
  id: string;
  email: string;
  product_url: string;
  product_name: string;
  last_known_price: number;
  created_at: string;
  notified_at: string | null;
  unsubscribed_at: string | null;
}

export interface CreateAlertInput {
  email: string;
  productUrl: string;
  productName: string;
  currentPrice: number;
}
