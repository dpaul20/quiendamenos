import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/platform/supabase";
import { queryHash } from "@/platform/supabase/hash";
import { PriceHistoryEntry } from "@/features/price-history/types";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json([] as PriceHistoryEntry[]);
  }

  const hash = queryHash(query);
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: rows, error } = await supabase
    .from("price_snapshots")
    .select("scraped_at, price_cents")
    .eq("query_hash", hash)
    .gte("scraped_at", cutoff)
    .order("scraped_at", { ascending: false });

  if (error || !rows) {
    return NextResponse.json([] as PriceHistoryEntry[]);
  }

  const byDate = new Map<string, number>();
  for (const row of rows) {
    const date = new Date(row.scraped_at).toISOString().slice(0, 10);
    const current = byDate.get(date);
    if (current === undefined || row.price_cents < current) {
      byDate.set(date, row.price_cents);
    }
  }

  const entries: PriceHistoryEntry[] = Array.from(byDate.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, minPrice]) => ({ date, minPrice }));

  return NextResponse.json(entries);
}
