/**
 * Inspect Fravega Apollo state items key and ML price selectors
 * Run: node scripts/inspect-fravega-apollo.mjs
 */
import axios from "axios";
import { load } from "cheerio";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "es-AR,es;q=0.9",
};

// ─── FRAVEGA Apollo items key ─────────────────
console.log("=== FRAVEGA Apollo state full ===");
try {
  const { data } = await axios.get("https://www.fravega.com/l/?keyword=samsung", {
    headers: { ...HEADERS, Referer: "https://www.fravega.com/" },
    maxRedirects: 5,
  });
  const $ = load(data);
  const nextData = JSON.parse($("script#__NEXT_DATA__").html());
  const apolloState = nextData?.props?.pageProps?.__APOLLO_STATE__;

  // Log all keys raw
  const keys = Object.keys(apolloState);
  console.log("All keys:\n", keys.map((k) => `  - ${k.slice(0, 100)}`).join("\n"));

  // Find items key
  const itemsKey = keys.find((k) => k.startsWith("items("));
  if (itemsKey) {
    const itemsValue = apolloState[itemsKey];
    console.log(`\nItems key: ${itemsKey.slice(0, 150)}`);
    console.log("Items value type:", typeof itemsValue, Array.isArray(itemsValue) ? `(array len ${itemsValue.length})` : "");
    console.log("Items value (2000):", JSON.stringify(itemsValue).slice(0, 2000));
  }

  // Dump ALL apollo state as JSON to file to inspect
  const fs = await import("fs");
  fs.writeFileSync("scripts/fravega-apollo-state.json", JSON.stringify(apolloState, null, 2));
  console.log("\n✅ Full Apollo state written to scripts/fravega-apollo-state.json");

} catch (e) {
  console.log("Error:", e.message);
  console.log(e.stack?.slice(0, 300));
}

// ─── FRAVEGA direct API call ──────────────────
console.log("\n=== FRAVEGA items GraphQL ===");
try {
  // Try direct GraphQL with the exact query from Apollo state
  const query = `
    query GetItems($filtering: ItemsFilterInput) {
      items(filtering: $filtering) {
        id
        name
        sku
        currentPrice { currentPrice bestPrice }
        pictures { url }
        url
        brand { name }
      }
    }
  `;
  const variables = {
    filtering: {
      active: true,
      availableStock: {
        includeThoseWithNoAvailableStockButListable: true,
        postalCodes: "",
      },
      keywords: { query: "samsung" },
      salesChannels: ["fravega-ecommerce"],
    },
  };
  const { data } = await axios.post(
    "https://www.fravega.com/api/v2",
    { query, variables },
    {
      headers: {
        ...HEADERS,
        "Content-Type": "application/json",
        Origin: "https://www.fravega.com",
        Referer: "https://www.fravega.com/l/?keyword=samsung",
      },
    },
  );
  console.log("Response:", JSON.stringify(data).slice(0, 1000));
} catch (e) {
  console.log("Error:", e.response?.status, JSON.stringify(e.response?.data).slice(0, 300), e.message);
}

// ─── FRAVEGA REST API for item search ─────────
console.log("\n=== FRAVEGA REST /api/v1/item-search ===");
const restEndpoints = [
  `https://www.fravega.com/api/v1/item-search/samsung?limit=20`,
  `https://www.fravega.com/api/v1/items?keywords=samsung&limit=20`,
  `https://www.fravega.com/api/v2/rest/item-search?q=samsung&limit=20`,
  `https://www.fravega.com/api/v1/search?keywords=samsung&limit=20&salesChannels=fravega-ecommerce`,
];
for (const endpoint of restEndpoints) {
  try {
    const { data } = await axios.get(endpoint, {
      headers: { ...HEADERS, Referer: "https://www.fravega.com/" },
    });
    console.log(`✅ ${endpoint.slice(30)}: ${JSON.stringify(data).slice(0, 300)}`);
    break;
  } catch (e) {
    console.log(`❌ ${endpoint.slice(30)}: ${e.response?.status || e.message}`);
  }
}
