import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

type StoreStatus = {
  status: "ok" | "slow" | "down";
  latency: number;
  count: number;
  error?: string;
};

type HealthPayload = {
  status: "ok" | "degraded" | "down";
  stores: Record<string, StoreStatus>;
  timestamp: string;
};

async function notifyEmail(payload: HealthPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL;
  if (!apiKey || !to) return;

  const resend = new Resend(apiKey);

  const rows = Object.entries(payload.stores)
    .map(([name, s]) => {
      const icon = s.status === "ok" ? "✅" : s.status === "slow" ? "⚠️" : "❌";
      const detail = s.error ? ` — ${s.error}` : ` (${s.latency}ms, ${s.count} resultados)`;
      return `<tr>
        <td style="padding:6px 12px">${icon} ${name}</td>
        <td style="padding:6px 12px">${s.status}${detail}</td>
      </tr>`;
    })
    .join("");

  await resend.emails.send({
    from: "quiendamenos <onboarding@resend.dev>",
    to,
    subject: `⚠️ quiendamenos — scrapers ${payload.status} (${payload.timestamp})`,
    html: `
      <h2 style="color:#b45309">Estado: ${payload.status.toUpperCase()}</h2>
      <table style="border-collapse:collapse;font-family:monospace;font-size:14px">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="padding:6px 12px;text-align:left">Tienda</th>
            <th style="padding:6px 12px;text-align:left">Estado</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="color:#6b7280;font-size:12px;margin-top:16px">${payload.timestamp}</p>
    `,
  });
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/health`);
  const data: HealthPayload = await res.json();

  if (data.status !== "ok") {
    await notifyEmail(data);
  }

  return NextResponse.json({ checked: true, status: data.status });
}
