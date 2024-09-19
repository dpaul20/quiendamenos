import { NextResponse } from "next/server";
import { scrapeWebsite } from "@/lib/scraper";
import { getCachedData, setCachedData } from "@/lib/cache";
import { addToQueue } from "@/lib/queue";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    // Verificar caché
    const cachedData = getCachedData(url);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Realizar scraping directamente
    const result = await scrapeWebsite(url);

    // Almacenar en caché
    setCachedData(url, result);

    // Agregar a la cola para futuras actualizaciones
    addToQueue(url);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in scrape route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
