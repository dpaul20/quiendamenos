/**
 * Final verification — run the actual TypeScript scrapers via tsx
 * Run: npx tsx scripts/verify-scrapers.mts
 */
import { scrapeNaldo } from "../src/stores/naldo/index";
import { scrapeCarrefour } from "../src/stores/carrefour/index";
import { scrapeFravega } from "../src/stores/fravega/index";
import { scrapeMercadoLibre } from "../src/stores/mercadolibre/index";
import { scrapeCetrogar } from "../src/stores/cetrogar/index";

const QUERY = "samsung";

async function test(name: string, fn: () => Promise<unknown[]>) {
  try {
    const start = Date.now();
    const results = await fn();
    const ms = Date.now() - start;
    if (results.length === 0) {
      console.log(`⚠️  ${name}: 0 results (${ms}ms)`);
    } else {
      const first = results[0] as Record<string, unknown>;
      console.log(`✅ ${name}: ${results.length} results (${ms}ms)`);
      console.log(`   name: "${first.name}"`);
      console.log(`   price: ${first.price}`);
      console.log(`   url: ${String(first.url).slice(0, 80)}`);
    }
  } catch (e) {
    console.log(`❌ ${name}: ${(e as Error).message}`);
  }
}

console.log(`Testing scrapers with query: "${QUERY}"\n`);

await test("Naldo (VTEX IS)", () => scrapeNaldo(QUERY));
await test("Carrefour (VTEX IS)", () => scrapeCarrefour(QUERY));
await test("Cetrogar (Cheerio)", () => scrapeCetrogar(QUERY));
await test("Fravega (Cheerio data-test-id)", () => scrapeFravega(QUERY));
await test("MercadoLibre (Cheerio .poly-card)", () => scrapeMercadoLibre(QUERY));

console.log("\nDone.");
