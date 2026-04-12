import axios from "axios";

const H = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json",
  "Accept-Language": "es-AR",
};

async function test(label, url) {
  try {
    const { data } = await axios.get(url, { headers: H, timeout: 10000 });
    if (Array.isArray(data)) {
      console.log(`✅ ${label}: ${data.length} results`);
      data.slice(0, 2).forEach((p) => console.log(`  - ${p.productName ?? p.name ?? JSON.stringify(p).slice(0, 60)}`));
    } else {
      console.log(`✅ ${label}: obj keys=${Object.keys(data).join(",").slice(0, 100)}, total=${data.recordsFiltered ?? data.total ?? "?"}`);
    }
  } catch (e) {
    console.log(`❌ ${label}: HTTP ${e.response?.status} ${e.message.slice(0, 60)}`);
  }
}

const BASE = "https://www.carrefour.com.ar";
const q = "lavavajillas";

// Classic VTEX Catalog API
await test("catalog/search", `${BASE}/api/catalog_system/pub/products/search/${encodeURIComponent(q)}?_from=0&_to=9`);
await test("catalog/search sc=1", `${BASE}/api/catalog_system/pub/products/search/${encodeURIComponent(q)}?_from=0&_to=9&sc=1`);

// VTEX catalog category search
await test("catalog/search/electro", `${BASE}/api/catalog_system/pub/products/search/${encodeURIComponent(q)}?_from=0&_to=9&fq=C:/Electro y tecnología/Lavado/Lavavajillas/`);

// IO Store search  
await test("io/search", `${BASE}/_v/public/graphql/v1`);

// ProductSearchResult
await test("product-search", `${BASE}/_v/api/intelligent-search/product_search/v3?query=${encodeURIComponent(q)}&count=5&from=0&to=4&locale=es-AR&hideUnavailableItems=false`);

// Try with operator=and
await test("IS + operator=and", `${BASE}/_v/api/intelligent-search/product_search/v3?query=${encodeURIComponent(q)}&count=5&from=0&to=4&locale=es-AR&operator=and`);

// Test IS with samsung again for comparison
await test("IS samsung (should work)", `${BASE}/_v/api/intelligent-search/product_search/v3?query=samsung&count=3&from=0&to=2&locale=es-AR&hideUnavailableItems=true`);

// Variant proxy IS (with segment)
await test("IS + segment channel", `${BASE}/_v/api/intelligent-search/product_search/v3?query=${encodeURIComponent(q)}&count=5&from=0&to=4&locale=es-AR&channel=%7B%22salesChannel%22%3A%221%22%7D`);
