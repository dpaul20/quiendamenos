import axios from "axios";
import { load } from "cheerio";

const H = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" };
const BASE = "https://www.carrefour.com.ar/_v/api/intelligent-search/product_search/v3";

async function testIS(label, params) {
  const url = `${BASE}?${new URLSearchParams(params)}`;
  const { data } = await axios.get(url, { headers: H });
  console.log(`${label}: total=${data?.recordsFiltered}, results=${data?.products?.length}`);
  data?.products?.slice(0, 2).forEach((p) => console.log(`  - ${p.productName}`));
}

console.log("=== operator variants ===");
// The IS API might handle operator=or differently
await testIS("lavavajillas operator=or", { query: "lavavajillas", count: 5, from: 0, to: 4, locale: "es-AR", operator: "or" });
await testIS("lavavajillas fuzzy=1", { query: "lavavajillas", count: 5, from: 0, to: 4, locale: "es-AR", fuzzy: "1" });
await testIS("lavavajillas fuzzy=auto", { query: "lavavajillas", count: 5, from: 0, to: 4, locale: "es-AR", fuzzy: "auto" });
// Try broader search with no hideUnavailableItems and no locale  
await testIS("lavavajillas no filters", { query: "lavavajillas", count: 5, from: 0, to: 4 });
// Try with segment
await testIS("lavarropas operator=or", { query: "lavarropas", count: 5, from: 0, to: 4, locale: "es-AR", operator: "or" });
await testIS("smart tv operator=or", { query: "smart tv", count: 5, from: 0, to: 4, locale: "es-AR", operator: "or" });

// Try fetching category page directly
console.log("\n=== Category page URLs ===");
async function testPage(q) {
  const url = `https://www.carrefour.com.ar/${encodeURIComponent(q)}`;
  try {
    const { data: html, request } = await axios.get(url, { headers: { ...H, Accept: "text/html" } });
    const products = html.match(/"productName":"[^"]+"/g);
    const finalPath = request?.path ?? url;
    console.log(`/${q} → ${finalPath}: ${products?.length ?? 0} products`);
    products?.slice(0, 2).forEach((p) => console.log(`  ${p}`));
  } catch (e) {
    console.log(`/${q}: ${e.response?.status ?? e.message}`);
  }
}

await testPage("lavavajillas");
await testPage("lavarropas");
await testPage("heladeras");
await testPage("microondas");
await testPage("smart-tv");
