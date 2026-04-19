import { scheduleRevalidation } from "@/platform/queue";
import { getQueryCache, setQueryCache, cacheKey } from "@/platform/cache";
import { scrapeWebsite } from "@/features/price-search/service";
import { NextRequest, NextResponse } from "next/server";
import { validateQuery } from "@/platform/query";
import { redactError } from "@/platform/errors";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const raw = searchParams.get("query");
    const validation = validateQuery(raw);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 400 }
      );
    }

    const query = validation.value;
    const key = cacheKey.query(query);
    const cached = await getQueryCache(key);

    if (cached) {
      if (cached.stale) {
        scheduleRevalidation(async () => {
          const fresh = await scrapeWebsite(query);
          await setQueryCache(key, fresh);
        });
      }
      return NextResponse.json(cached.data);
    }

    // Cache miss — hacer scraping de todas las tiendas, cachear resultado y responder
    const result = await scrapeWebsite(query);
    await setQueryCache(key, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in scrape route:", error);
    return NextResponse.json(redactError(error), { status: 500 });
  }
}
