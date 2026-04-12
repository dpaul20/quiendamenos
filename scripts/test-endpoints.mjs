/**
 * Test each scraper strategy to see what works.
 * Run: node scripts/test-endpoints.mjs
 */
import axios from "axios";
import { load } from "cheerio";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "es-AR,es;q=0.9",
};

function ok(label, data) {
  const count =
    Array.isArray(data) ? data.length
    : typeof data === "object" ? Object.keys(data).length
    : 0;
  console.log(`✅ ${label} — ${count} items`);
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0];
    console.log(
      `   Sample: ${first.name || first.productName || first.title || JSON.stringify(first).slice(0, 80)}`,
    );
    if (first.price || first.priceRange)
      console.log(
        `   Price: ${first.price || first.priceRange?.sellingPrice?.lowPrice}`,
      );
  }
}
function fail(label, err) {
  const msg =
    err?.response
      ? `HTTP ${err.response.status} — ${String(err.response.data).slice(0, 120)}`
      : err?.message;
  console.log(`❌ ${label} — ${msg}`);
}

// ─────────────────────────────────────────────
//  NALDO
// ─────────────────────────────────────────────
async function testNaldo_oldGraphQL() {
  // Old: productSearchV3 persisted query
  const hash = "3e2c473672fc986dc5377d35560f5d5244fbca3698414bd02772c649d67994b6";
  const vars = Buffer.from(
    JSON.stringify({
      hideUnavailableItems: true,
      fullText: "samsung",
      count: 10,
    }),
  ).toString("base64");
  const ext = encodeURIComponent(
    JSON.stringify({
      persistedQuery: {
        version: 1,
        sha256Hash: hash,
        sender: "vtex.store-resources@0.x",
        provider: "vtex.search-graphql@0.x",
      },
      variables: vars,
    }),
  );
  const url = `https://www.naldo.com.ar/_v/segment/graphql/v1?workspace=master&maxAge=medium&appsEtag=remove&domain=store&locale=es-AR&operationName=productSearchV3&variables=%7B%7D&extensions=${ext}`;
  const { data } = await axios.get(url, { headers: HEADERS });
  const products = data?.data?.productSearch?.products;
  if (!products?.length) throw new Error(`No products. Keys: ${JSON.stringify(Object.keys(data?.data || {}))}`);
  return products;
}

async function testNaldo_intelligentSearch() {
  // New VTEX Intelligent Search REST endpoint
  const url = `https://www.naldo.com.ar/_v/api/intelligent-search/product_search/v3?query=samsung&count=20&from=0&to=19&locale=es-AR&hideUnavailableItems=true&workspace=master`;
  const { data } = await axios.get(url, { headers: HEADERS });
  const products = data?.data?.productSearch?.products || data?.products || data?.data?.products;
  if (!products?.length) throw new Error(`No products. Keys top: ${JSON.stringify(Object.keys(data || {}))}, data: ${JSON.stringify(Object.keys(data?.data || {}))}`);
  return products;
}

async function testNaldo_intelligentSearch_v2() {
  // VTEX IS via segment graphql v1 but with fullText search operation
  const url = `https://www.naldo.com.ar/_v/api/intelligent-search/search_suggestions?query=samsung&locale=es-AR&workspace=master`;
  const { data } = await axios.get(url, { headers: HEADERS });
  if (!data?.searches?.length) throw new Error(`No suggestions. Keys: ${JSON.stringify(Object.keys(data || {}))}`);
  return data.searches;
}

// ─────────────────────────────────────────────
//  CARREFOUR
// ─────────────────────────────────────────────
async function testCarrefour_oldGraphQL() {
  const hash = "c9ba53c47cbd7904ee373791cf16738106db3a39cde16beb2b53d3adb71d37d0";
  const vars = Buffer.from(
    JSON.stringify({
      hideUnavailableItems: true,
      query: "samsung",
      orderBy: "OrderByScoreDESC",
      from: 0,
      to: 15,
    }),
  ).toString("base64");
  const ext = encodeURIComponent(
    JSON.stringify({
      persistedQuery: {
        version: 1,
        sha256Hash: hash,
        sender: "vtex.store-resources@0.x",
        provider: "vtex.search-graphql@0.x",
      },
      variables: vars,
    }),
  );
  const url = `https://www.carrefour.com.ar/_v/segment/graphql/v1?workspace=master&maxAge=short&appsEtag=remove&domain=store&locale=es-AR&operationName=productSearchV3&variables=%7B%7D&extensions=${ext}`;
  const { data } = await axios.get(url, { headers: HEADERS });
  const products = data?.data?.productSearch?.products;
  if (!products?.length) throw new Error(`No products. Keys: ${JSON.stringify(Object.keys(data?.data || {}))}`);
  return products;
}

async function testCarrefour_intelligentSearch() {
  const url = `https://www.carrefour.com.ar/_v/api/intelligent-search/product_search/v3?query=samsung&count=20&from=0&to=19&locale=es-AR&hideUnavailableItems=true`;
  const { data } = await axios.get(url, { headers: HEADERS });
  const products = data?.data?.productSearch?.products || data?.products || data?.data?.products;
  if (!products?.length) throw new Error(`No products. Keys top: ${JSON.stringify(Object.keys(data || {}))}`);
  return products;
}

// ─────────────────────────────────────────────
//  MERCADOLIBRE
// ─────────────────────────────────────────────
async function testML_cheerio() {
  const url = `https://listado.mercadolibre.com.ar/samsung`;
  const { data } = await axios.get(url, { headers: HEADERS });
  const $ = load(data);
  const products = $(".poly-card.poly-card--list").map((_, el) => ({
    name: $(el).find(".poly-component__title").text().trim(),
  })).get().filter((p) => p.name);
  if (!products.length) throw new Error("No .poly-card.poly-card--list elements found");
  return products;
}

async function testML_publicApi() {
  const url = `https://api.mercadolibre.com/sites/MLA/search?q=samsung&limit=20`;
  const { data } = await axios.get(url, { headers: HEADERS });
  const products = data?.results;
  if (!products?.length) throw new Error("No results in ML API response");
  return products.map((p) => ({ name: p.title, price: p.price, url: p.permalink, image: p.thumbnail }));
}

// ─────────────────────────────────────────────
//  CETROGAR
// ─────────────────────────────────────────────
async function testCetrogar() {
  const url = `https://www.cetrogar.com.ar/catalogsearch/result/?q=samsung`;
  const { data } = await axios.get(url, { headers: HEADERS });
  const $ = load(data);
  const products = $(".item.product.product-item").map((_, el) => {
    const name = $(el).find(".product.name.product-item-name").text().trim();
    const price = $(el).find("span[data-price-type='finalPrice']").text().trim();
    return { name, price };
  }).get().filter((p) => p.name);
  if (!products.length) throw new Error("No .item.product.product-item found");
  return products;
}

// ─────────────────────────────────────────────
//  FRAVEGA
// ─────────────────────────────────────────────
async function testFravega_cheerio() {
  const url = `https://www.fravega.com/l/?keyword=samsung`;
  const { data } = await axios.get(url, {
    headers: { ...HEADERS, Referer: "https://www.fravega.com/" },
    maxRedirects: 5,
  });
  const $ = load(data);
  const products = $("article[data-test-id='result-item']").map((_, el) => ({
    name: $(el).find("a > div > div > span").text().trim(),
  })).get().filter((p) => p.name);
  if (!products.length) {
    // check what the page actually is
    const title = $("title").text();
    throw new Error(`No articles found. Page title: "${title}". HTML length: ${data.length}`);
  }
  return products;
}

async function testFravega_graphql() {
  // Try to call Fravega's internal GraphQL API directly
  const url = `https://www.fravega.com/api/v2`;
  const query = `
    query SearchProducts($q: String!, $page: Int, $limit: Int) {
      searchProducts(query: $q, page: $page, limit: $limit) {
        items {
          id
          name
          price
          image
          url
        }
      }
    }
  `;
  const { data } = await axios.post(
    url,
    { query, variables: { q: "samsung", page: 1, limit: 20 } },
    {
      headers: {
        ...HEADERS,
        "Content-Type": "application/json",
        Origin: "https://www.fravega.com",
        Referer: "https://www.fravega.com/",
      },
    },
  );
  if (data?.errors) throw new Error(JSON.stringify(data.errors).slice(0, 200));
  const items = data?.data?.searchProducts?.items;
  if (!items?.length) throw new Error(`No items. Response: ${JSON.stringify(data).slice(0, 300)}`);
  return items;
}

async function testFravega_restSearch() {
  // Try documented REST search endpoint
  const url = `https://www.fravega.com/api/v1/search/results?q=samsung&limit=20&offset=0`;
  const { data } = await axios.get(url, {
    headers: { ...HEADERS, Referer: "https://www.fravega.com/" },
  });
  const items = data?.results || data?.items || data?.products;
  if (!items?.length) throw new Error(`No items. Keys: ${JSON.stringify(Object.keys(data || {}))}`);
  return items;
}

// ─────────────────────────────────────────────
//  MUSIMUNDO
// ─────────────────────────────────────────────
async function testMusimundo_braindw() {
  const url = `https://u.braindw.com/els/musimundoapi?ft=samsung&qt=20&sc=emsa&refreshmetadata=true&exclusive=0`;
  const { data } = await axios.get(url, { headers: HEADERS });
  if (!data?.hits?.hits?.length) throw new Error(`No hits. Response: ${JSON.stringify(data).slice(0, 200)}`);
  return data.hits.hits;
}

async function testMusimundo_site() {
  const url = `https://www.musimundo.com/search?Ntt=samsung`;
  const { data } = await axios.get(url, { headers: HEADERS });
  const $ = load(data);
  const title = $("title").text();
  const bodyLen = $("body").text().trim().length;
  throw new Error(`Site response. Title: "${title}". Body chars: ${bodyLen}`);
}

// ─────────────────────────────────────────────
//  RUN ALL
// ─────────────────────────────────────────────
async function run(label, fn) {
  try {
    const result = await fn();
    ok(label, result);
  } catch (e) {
    fail(label, e);
  }
}

console.log("\n=== NALDO ===");
await run("Naldo: Old GraphQL productSearchV3", testNaldo_oldGraphQL);
await run("Naldo: Intelligent Search REST v3", testNaldo_intelligentSearch);
await run("Naldo: IS search suggestions", testNaldo_intelligentSearch_v2);

console.log("\n=== CARREFOUR ===");
await run("Carrefour: Old GraphQL productSearchV3", testCarrefour_oldGraphQL);
await run("Carrefour: Intelligent Search REST v3", testCarrefour_intelligentSearch);

console.log("\n=== MERCADOLIBRE ===");
await run("MercadoLibre: Cheerio .poly-card", testML_cheerio);
await run("MercadoLibre: Public API", testML_publicApi);

console.log("\n=== CETROGAR ===");
await run("Cetrogar: Cheerio .product-item", testCetrogar);

console.log("\n=== FRAVEGA ===");
await run("Fravega: Cheerio scraper", testFravega_cheerio);
await run("Fravega: GraphQL /api/v2", testFravega_graphql);
await run("Fravega: REST /api/v1/search", testFravega_restSearch);

console.log("\n=== MUSIMUNDO ===");
await run("Musimundo: BrainDW API", testMusimundo_braindw);
await run("Musimundo: Site HTML", testMusimundo_site);

console.log("\nDone.");
