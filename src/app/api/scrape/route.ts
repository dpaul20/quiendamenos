import { addToQueue } from "@/lib/queue";
import { getCachedData, setCachedData } from "@/lib/cache";
import { scrapeWebsite } from "@/lib/scraper";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!isValidQuery(query)) {
      return NextResponse.json(
        { error: "Invalid query parameter" },
        { status: 400 }
      );
    }

    const cachedData = await getCachedDataIfNeeded(query);

    if (cachedData && cachedData.length > 0) {
      return NextResponse.json(cachedData);
    }

    const result = await scrapeAndCache(query);
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
  // Implementar validación de query
  return typeof query === "string" && query.trim().length > 0;
}

async function getCachedDataIfNeeded(query: string) {
  const cachedData = await getCachedData(query);
  if (cachedData && cachedData.length > 0) {
    return cachedData;
  }

  return null;
}

async function scrapeAndCache(query: string) {
  try {
    const result = await scrapeWebsite(query);
    await setCachedData(query, result);

    addToQueue(query);

    return result;
  } catch (error) {
    console.error("Error scraping website:", error);
    // No cachear el error
    throw error;
  }
}
