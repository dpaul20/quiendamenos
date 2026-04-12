import axios from "axios";

const H = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" };
const BASE = "https://www.carrefour.com.ar/_v/api/intelligent-search/product_search/v3";

async function inspect(q) {
  const url = `${BASE}?${new URLSearchParams({ query: q, count: 5, from: 0, to: 4, locale: "es-AR", hideUnavailableItems: "true" })}`;
  const { data } = await axios.get(url, { headers: H });
  console.log(`\n=== "${q}" ===`);
  console.log("Total:", data?.recordsFiltered);
  console.log("Redirect:", data?.redirect);
  console.log("Correction:", JSON.stringify(data?.correction));
  console.log("Fuzzy:", data?.fuzzy);
  console.log("Operator:", data?.operator);
  console.log("Translated:", data?.translated);
  console.log("Options (first 3):", data?.options?.slice(0, 3));
}

await inspect("lavavajillas");
await inspect("lavarropas");
await inspect("heladera");
await inspect("smart tv");
await inspect("samsung"); // for comparison - known working
await inspect("drean"); // another working one
