import axios from "axios";

const H = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" };
const BASE = "https://www.carrefour.com.ar/_v/api/intelligent-search/product_search/v3";

async function test(q, extra = {}) {
  const params = { query: q, count: 5, from: 0, to: 4, locale: "es-AR", hideUnavailableItems: "true", ...extra };
  const url = `${BASE}?${new URLSearchParams(params)}`;
  const { data } = await axios.get(url, { headers: H });
  const ps = data?.products;
  console.log(`"${q}" (total=${data?.recordsFiltered}): ${ps?.length} results`);
  ps?.slice(0, 2).forEach((p) => console.log(`  - ${p.productName}`));
}

// Test appliance brands
await test("drean");
await test("BGH lavavajillas");
await test("whirlpool");
await test("electrolux");
await test("LVDR1406CI0"); // SKU
await test("lavavajillas 14 cubiertos"); // longer phrase
await test("lavavajillas drean"); // brand + cat
await test("dishwasher");
await test("lavarropas");
await test("heladera");
await test("smart tv");
await test("aire acondicionado");
await test("microondas");
