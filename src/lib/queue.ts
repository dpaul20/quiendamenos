import Queue from 'bull';
import { scrapeWebsite } from './scraper';

const scrapingQueue = new Queue('scraping', process.env.REDIS_URL);

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