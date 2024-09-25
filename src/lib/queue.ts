import Queue from "bull";
import { scrapeWebsite } from "./scraper";

const redisUrl = process.env.REDIS_URL ?? "127.0.0.1"

const scrapingQueue = new Queue("scraping", redisUrl);

export function addToQueue(query: string) {
  scrapingQueue.add({ query });
}

export function processQueue() {
  scrapingQueue.process(async (job) => {
    const { query } = job.data;
    await scrapeWebsite(query);
  });
}

// Iniciar el procesamiento de la cola
processQueue();
