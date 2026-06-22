import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/platform/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ALERTS_PER_EMAIL = 10;

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, productUrl, productName, currentPrice } = body as Record<
    string,
    unknown
  >;

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Invalid or missing email address" },
      { status: 400 },
    );
  }

  if (!productUrl || typeof productUrl !== "string") {
    return NextResponse.json(
      { error: "productUrl is required" },
      { status: 400 },
    );
  }

  if (!productName || typeof productName !== "string") {
    return NextResponse.json(
      { error: "productName is required" },
      { status: 400 },
    );
  }

  if (typeof currentPrice !== "number") {
    return NextResponse.json(
      { error: "currentPrice must be a number" },
      { status: 400 },
    );
  }

  // Enforce max 10 active alerts per email
  const { data: countData, error: countError } = await supabase
    .from("price_alerts")
    .select("count")
    .eq("email", email)
    .is("unsubscribed_at", null)
    .limit(1)
    .single();

  if (
    !countError &&
    countData &&
    (countData as { count: number }).count >= MAX_ALERTS_PER_EMAIL
  ) {
    return NextResponse.json(
      {
        error: `Alert limit reached (max ${MAX_ALERTS_PER_EMAIL} active alerts per email)`,
      },
      { status: 429 },
    );
  }

  const { error: upsertError } = await supabase.from("price_alerts").upsert(
    {
      email,
      product_url: productUrl,
      product_name: productName,
      last_known_price: currentPrice,
    },
    { onConflict: "email,product_url" },
  );

  if (upsertError) {
    console.error("[price-alerts] upsert error:", upsertError);
    return NextResponse.json(
      { error: "Failed to save alert" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
