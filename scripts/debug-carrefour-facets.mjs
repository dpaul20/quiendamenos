/**
 * Test Carrefour IS API with category facets filtering
 * node scripts/debug-carrefour-facets.mjs
 */
import axios from "axios";

const H = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" };
const BASE = "https://www.carrefour.com.ar/_v/api/intelligent-search/product_search/v3";

async function test(label, url) {
  try {
    const { data } = await axios.get(url, { headers: H });
    const products = data?.products;
    console.log(`\n✅ ${label}: ${products?.length} results`);
    products?.slice(0, 3).forEach((p, i) => {
      console.log(`  ${i + 1}. [${p.categoryId || p.productId}] ${p.productName} — $${p.priceRange?.sellingPrice?.lowPrice}`);
    });
  } catch (e) {
    console.log(`\n❌ ${label}: HTTP ${e.response?.status} — ${JSON.stringify(e.response?.data).slice(0, 150)}`);
  }
}

const q = "lavavajillas";

// 1. Without any facet filter (current — polluted with super)
await test(
  "No filter",
  `${BASE}?query=${q}&count=5&from=0&to=4&locale=es-AR&hideUnavailableItems=true`,
);

// 2. selectedFacets=c:electro-y-tecnologia (top dept)
await test(
  "selectedFacets=c:electro-y-tecnologia",
  `${BASE}?query=${q}&count=5&from=0&to=4&locale=es-AR&hideUnavailableItems=true&selectedFacets=c%3Aelectro-y-tecnologia`,
);

// 3. selectedFacets=c:electro-y-tecnologia,c:lavado
await test(
  "selectedFacets=c:electro-y-tecnologia,c:lavado",
  `${BASE}?query=${q}&count=5&from=0&to=4&locale=es-AR&hideUnavailableItems=true&selectedFacets=c%3Aelectro-y-tecnologia%2Cc%3Alavado`,
);

// 4. department filter via map + query path (old VTEX style in IS)
await test(
  "query=electro-y-tecnologia/lavavajillas&map=c,ft",
  `${BASE}?query=electro-y-tecnologia%2F${q}&map=c%2Cft&count=5&from=0&to=4&locale=es-AR&hideUnavailableItems=true`,
);

// 5. Use the category browse URL pattern
await test(
  "/l/electro-y-tecnologia?query=lavavajillas",
  `https://www.carrefour.com.ar/_v/api/intelligent-search/product_search/v3?query=${q}&map=c&count=5&from=0&to=4&locale=es-AR&hideUnavailableItems=true&selectedFacets=c%3Aelectro-y-tecnologia`,
);

// Also inspect what samsung returns with facet (should still work)
console.log("\n--- samsung with electro filter ---");
await test(
  "samsung + electro filter",
  `${BASE}?query=samsung&count=3&from=0&to=2&locale=es-AR&hideUnavailableItems=true&selectedFacets=c%3Aelectro-y-tecnologia`,
);
