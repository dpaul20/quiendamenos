import { scrapeCarrefour } from "../src/stores/carrefour/index.ts";

const queries = ["lavavajillas", "samsung", "heladera", "lavarropas", "smart tv"];

for (const q of queries) {
  console.log(`\n[${q}]`);
  try {
    const results = await scrapeCarrefour(q);
    console.log(`  ${results.length} results`);
    results.slice(0, 2).forEach((p) => console.log(`  - ${p.name} | $${p.price}`));
  } catch (e) {
    console.log(`  ERROR: ${e}`);
  }
}
