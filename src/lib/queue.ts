import Queue from 'bull';
import { scrapeWebsite } from './scraper';

const scrapingQueue = new Queue('scraping', process.env.REDIS_URL);

export function addToQueue(url) {
  return scrapingQueue.add({ url });
}

export function processQueue() {
  scrapingQueue.process(async (job) => {
    const { url } = job.data;
    console.log(`Processing job for URL: ${url}`);
    try {
      const result = await scrapeWebsite(url);
      console.log(`Job completed for URL: ${url}`);
      return result;
    } catch (error) {
      console.error(`Error processing job for URL: ${url}`, error);
      throw error;
    }
  });

  scrapingQueue.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed. Scraped ${result.length} products.`);
  });

  scrapingQueue.on('failed', (job, error) => {
    console.error(`Job ${job.id} failed:`, error);
  });
}

// Iniciar el procesamiento de la cola
processQueue();