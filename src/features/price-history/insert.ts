import { Product } from "@/types/product";
import { getSupabaseClient } from "@/platform/supabase";
import { queryHash } from "@/platform/supabase/hash";
import { PriceSnapshot } from "./types";

export async function batchInsertSnapshots(
  products: Product[],
  query: string,
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const hash = queryHash(query);

  const snapshots: PriceSnapshot[] = products
    .filter((p) => p.price != null && p.url != null)
    .map((p) => ({
      store: p.from,
      query_hash: hash,
      product_name: p.name ?? "",
      price_cents: Math.round(p.price! * 100),
      url: p.url!,
    }));

  if (snapshots.length === 0) return;

  const { error } = await supabase.from("price_snapshots").insert(snapshots);
  if (error) {
    // Silencioso — no relanzar
    console.warn("[price-history] insert failed:", error.message);
  }
}
