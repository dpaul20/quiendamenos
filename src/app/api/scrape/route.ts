import { scheduleRevalidation } from "@/platform/queue";
import { getQueryCache, setQueryCache, cacheKey } from "@/platform/cache";
import { scrapeWebsite } from "@/features/price-search/service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { error: "Missing query parameter" },
        { status: 400 }
      );
    }

    if (!isValidQuery(query)) {
      return NextResponse.json(
        { error: "Invalid query parameter" },
        { status: 400 }
      );
    }

    const key = cacheKey.query(query);
    const cached = await getQueryCache(key);

    if (cached) {
      if (cached.stale) {
        // Stale-While-Revalidate: serve immediately, refresh in background
        scheduleRevalidation(query);
      }
      return NextResponse.json(cached.data);
    }

    // Cache miss — scrape all stores, cache result, respond
    const result = await scrapeWebsite(query);
    await setQueryCache(key, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in scrape route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function isValidQuery(query: unknown): boolean {
  return typeof query === "string" && query.trim().length > 0;
}
