import { NextResponse } from "next/server";
import { scrapers } from "@/scrapers";

const PROBE_QUERY = "smart tv";
const TIMEOUT_MS = 8_000;

type StoreStatus = {
  status: "ok" | "slow" | "down";
  latency: number;
  count: number;
  error?: string;
};

async function probeStore(name: string): Promise<StoreStatus> {
  const scraper = scrapers[name];
  if (!scraper) return { status: "down", latency: 0, count: 0, error: "not found" };

  const start = Date.now();
  try {
    const result = await Promise.race([
      scraper(PROBE_QUERY),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS),
      ),
    ]);
    const latency = Date.now() - start;
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
  const overallStatus =
    statuses.every((s) => s === "ok")
      ? "ok"
      : statuses.every((s) => s === "down")
        ? "down"
        : "degraded";

  const httpStatus = overallStatus === "down" ? 503 : 200;

  return NextResponse.json(
    { status: overallStatus, stores, timestamp: new Date().toISOString() },
    { status: httpStatus },
  );
}
