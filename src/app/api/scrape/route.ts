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

    const isDev = process.env.NODE_ENV === "development";
    const cachedData = await getCachedDataIfNeeded(query, isDev);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const result = await scrapeAndCache(query, isDev);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in scrape route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function isValidQuery(query: any): boolean {
  // Implementar validación de query
  return typeof query === "string" && query.trim().length > 0;
}

async function getCachedDataIfNeeded(query: string, isDev: boolean) {
  if (!isDev) {
    const cachedData = await getCachedData(query);
    if (cachedData) {
      return cachedData;
    }
  }
  return null;
}

async function scrapeAndCache(query: string, isDev: boolean) {
  const result = await scrapeWebsite(query);
  await setCachedData(query, result);
  if (!isDev) {
    addToQueue(query);
  }
  return result;
}
