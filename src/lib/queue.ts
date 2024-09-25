import Queue from "bull";
import { scrapeWebsite } from "./scraper";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL environment variable is not defined");
}

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
