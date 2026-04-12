import axios from "axios";

const H = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml",
  "Accept-Language": "es-AR,es;q=0.9",
};

// 1. Fetch category page and inspect embedded data
console.log("=== Fetching category page ===");
const { data: html } = await axios.get(
  "https://www.carrefour.com.ar/electro-y-tecnologia/lavado/lavavajillas",
  { headers: H },
);

const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
if (nextDataMatch) {
  const json = JSON.parse(nextDataMatch[1]);
  console.log("NEXT_DATA keys:", Object.keys(json));
  console.log("props keys:", Object.keys(json.props || {}));
  console.log("pageProps keys:", Object.keys(json.props?.pageProps || {}));
  const str = JSON.stringify(json.props?.pageProps || {});
  console.log("pageProps length:", str.length);
  const productMatch = str.match(/"productName":"[^"]+"/g);
  console.log("Products found:", productMatch?.slice(0, 3));
  const apiMatch = str.match(/intelligent-search[^"]{0,120}/g);
  console.log("API hints:", apiMatch?.slice(0, 3));
} else {
  console.log("No __NEXT_DATA__");
  const apiMatch = html.match(/intelligent-search[^"]{0,100}/g);
  console.log("API hints in HTML:", apiMatch?.slice(0, 3));
  console.log("HTML length:", html.length);
  console.log("First 500:", html.slice(0, 500));
}

// 2. Try the IS API with different workspace/account params
console.log("\n=== Testing IS API variants ===");
const BASE = "https://www.carrefour.com.ar/_v/api/intelligent-search/product_search/v3";

async function test(label, params) {
  try {
    const url = `${BASE}?${new URLSearchParams(params)}`;
    const { data } = await axios.get(url, { headers: H, timeout: 10000 });
    const ps = data?.products;
    console.log(`${label}: ${ps?.length} results, total=${data?.recordsFiltered}`);
    ps?.slice(0, 2).forEach((p) => console.log(`  - ${p.productName}`));
  } catch (e) {
    console.log(`${label}: ERROR ${e.response?.status} ${e.message.slice(0, 80)}`);
  }
}

// Try ignoring hideUnavailableItems
await test("no hideUnavailable", { query: "lavavajillas", count: 5, from: 0, to: 4, locale: "es-AR" });

// Try with workspace parameter
await test("+ workspace master", { query: "lavavajillas", count: 5, from: 0, to: 4, locale: "es-AR", workspace: "master" });

// Try lowercase category path
await test("category path c,c,c", { query: "electro-y-tecnologia/lavado/lavavajillas", map: "c,c,c", count: 5, from: 0, to: 4, locale: "es-AR" });

// Try just the leaf category
await test("leaf category map=c", { query: "lavavajillas", map: "c", count: 5, from: 0, to: 4, locale: "es-AR" });

// Try with segment
await test("+ segment", { query: "electro-y-tecnologia", map: "c", count: 5, from: 0, to: 4, locale: "es-AR" });
