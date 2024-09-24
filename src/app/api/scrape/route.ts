import { NextResponse } from "next/server";
import { scrapeWebsite } from "@/lib/scraper";
import { getCachedData, setCachedData } from "@/lib/cache";
import { addToQueue } from "@/lib/queue";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    const isDev = process.env.NODE_ENV === "development";

    // Verificar caché
    if (!isDev) {
      const cachedData = await getCachedData(query);
      if (cachedData) {
        return NextResponse.json(cachedData);
      }
    }

    // Realizar scraping directamente
    const result = await scrapeWebsite(query);

    // Almacenar en caché
    await setCachedData(query, result);

    // Agregar a la cola para futuras actualizaciones
    addToQueue(query);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in scrape route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}