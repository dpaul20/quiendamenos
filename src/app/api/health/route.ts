import { NextResponse } from "next/server";
import { scrapers } from "@/scrapers";

const PROBE_QUERY = "smart tv";
const TIMEOUT_MS = 8_000;

type StoreStatus = {
  status: "ok" | "slow" | "empty" | "down";
  latency: number;
  count: number;
  error?: string;
};

async function probeStore(name: string): Promise<StoreStatus> {
  const scraper = scrapers[name];
  if (!scraper)
    return { status: "down", latency: 0, count: 0, error: "not found" };

  const start = Date.now();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      scraper(PROBE_QUERY),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS);
      }),
    ]);
    const latency = Date.now() - start;
    // La query de sondeo ("smart tv") siempre debería traer resultados: una
    // lista vacía sin excepción significa que el scraper se rompió en silencio
    // (cambió el HTML, la API devuelve otra forma), no que no haya stock.
    if (result.length === 0) {
      return { status: "empty", latency, count: 0 };
    }
    return {
      status: latency > TIMEOUT_MS * 0.8 ? "slow" : "ok",
      latency,
      count: result.length,
    };
  } catch (err) {
    return {
      status: "down",
      latency: Date.now() - start,
      count: 0,
      error: err instanceof Error ? err.message : "unknown",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET() {
  const storeNames = Object.keys(scrapers).filter((k) => k !== "default");

  const results = await Promise.allSettled(
    storeNames.map(async (name) => [name, await probeStore(name)] as const),
  );

  const stores: Record<string, StoreStatus> = {};
  for (const r of results) {
    if (r.status === "fulfilled") {
      const [name, status] = r.value;
      stores[name] = status;
    }
  }

  const statuses = Object.values(stores).map((s) => s.status);
  // "empty" es una tienda rota: cuenta como caída para el estado general. Si
  // todas vienen vacías o caídas, el servicio está down (503); si solo algunas,
  // degraded — en ambos casos health-check dispara la alerta por email.
  const overallStatus = statuses.every((s) => s === "ok")
    ? "ok"
    : statuses.every((s) => s === "down" || s === "empty")
      ? "down"
      : "degraded";

  const httpStatus = overallStatus === "down" ? 503 : 200;

  return NextResponse.json(
    { status: overallStatus, stores, timestamp: new Date().toISOString() },
    { status: httpStatus },
  );
}
