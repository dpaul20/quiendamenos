import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/platform/supabase";
import { scrapeWebsite } from "@/features/price-search/service";
import { getResendClient } from "@/platform/email/client";
import { renderPriceDropEmail } from "@/platform/email/priceDropEmail";
import { signToken } from "@/platform/alerts/token";
import type { PriceAlert } from "@/features/price-alerts/types";

export async function GET(req: NextRequest) {
  try {
    // 1. Auth check
    const authHeader = req.headers.get("Authorization");
    const expected = `Bearer ${process.env.CRON_SECRET}`;
    if (!authHeader || authHeader !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Supabase client
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase unavailable" },
        { status: 503 },
      );
    }

    // 3. Load active alerts
    const { data: alerts, error: fetchError } = await supabase
      .from("price_alerts")
      .select("*")
      .is("unsubscribed_at", null);

    if (fetchError) {
      throw fetchError;
    }

    const activeAlerts = (alerts ?? []) as PriceAlert[];

    // 4. Group by product_name to avoid re-scraping the same product
    const byName = new Map<string, PriceAlert[]>();
    for (const alert of activeAlerts) {
      const group = byName.get(alert.product_name) ?? [];
      group.push(alert);
      byName.set(alert.product_name, group);
    }

    let checked = 0;
    let notified = 0;
    let skipped = 0;

    const resend = getResendClient();
    const baseUrl = process.env.BASE_URL ?? "";

    for (const [productName, group] of byName) {
      // 5. Scrape once per product name
      let offers: { url?: string; price?: number; name?: string }[] = [];
      try {
        offers = await scrapeWebsite(productName);
      } catch {
        skipped += group.length;
        continue;
      }

      for (const alert of group) {
        checked++;

        // Find matching offer by URL
        const offer = offers.find((o) => o.url === alert.product_url);

        if (!offer || offer.price == null) {
          // 6. Offer not found — skip, no false alert
          skipped++;
          continue;
        }

        const currentPrice = offer.price;
        const didDrop = currentPrice < alert.last_known_price;

        if (didDrop) {
          // 7. Price dropped — send email + update notified_at and last_known_price
          if (resend) {
            try {
              const token = signToken(alert.email, alert.product_url);
              const unsubscribeUrl = `${baseUrl}/api/price-alerts/unsubscribe?token=${token}&email=${encodeURIComponent(alert.email)}&url=${encodeURIComponent(alert.product_url)}`;
              const { subject, html } = renderPriceDropEmail({
                productName: alert.product_name,
                productUrl: alert.product_url,
                oldPrice: alert.last_known_price,
                newPrice: currentPrice,
                unsubscribeUrl,
              });

              await resend.emails.send({
                from: "quiendamenos <no-reply@quiendamenos.com>",
                to: alert.email,
                subject,
                html,
              });
              notified++;
            } catch {
              // Email send failed — still update DB
            }
          }

          await supabase
            .from("price_alerts")
            .update({
              notified_at: new Date().toISOString(),
              last_known_price: currentPrice,
            })
            .eq("id", alert.id);
        } else {
          // 8. Price unchanged or raised — update baseline only, no email
          await supabase
            .from("price_alerts")
            .update({ last_known_price: currentPrice })
            .eq("id", alert.id);
        }
      }
    }

    return NextResponse.json({ checked, notified, skipped }, { status: 200 });
  } catch (err) {
    console.error("[check-prices cron] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
