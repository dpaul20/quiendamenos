import type { AlertProduct, SubscribeResult } from "./types";

export async function subscribeAlert(
  email: string,
  product: AlertProduct,
): Promise<SubscribeResult> {
  const res = await fetch("/api/price-alerts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      productUrl: product.url,
      productName: product.name,
      currentPrice: product.price,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as { error?: string }).error ?? `Request failed: ${res.status}`,
    );
  }

  return res.json() as Promise<SubscribeResult>;
}
