import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/platform/supabase";
import { verifyToken } from "@/platform/alerts/token";

const CONFIRMATION_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Seguimiento cancelado</title>
</head>
<body style="font-family:sans-serif;background:#f4f4f5;margin:0;padding:48px 16px;text-align:center;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:8px;padding:40px;">
    <h1 style="font-size:20px;color:#18181b;margin:0 0 16px;">Dejaste de seguir este producto.</h1>
    <p style="color:#52525b;margin:0;">Ya no recibirás alertas de precio para este producto.</p>
  </div>
</body>
</html>`;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const email = searchParams.get("email") ?? "";
  const url = searchParams.get("url") ?? "";
  const token = searchParams.get("token") ?? "";

  if (!email || !url || !token) {
    return new NextResponse("Missing required parameters", { status: 400 });
  }

  if (!verifyToken(email, url, token)) {
    return new NextResponse("Invalid token", { status: 400 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return new NextResponse("Service temporarily unavailable", { status: 503 });
  }

  const { error } = await supabase
    .from("price_alerts")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("email", email)
    .eq("product_url", url);

  if (error) {
    console.error("[price-alerts/unsubscribe] update error:", error);
    return new NextResponse("Failed to process unsubscribe", { status: 500 });
  }

  return new NextResponse(CONFIRMATION_HTML, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
