/**
 * Find correct selectors in Fravega and MercadoLibre HTML.
 * Run: node scripts/inspect-selectors.mjs
 */
import axios from "axios";
import { load } from "cheerio";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "es-AR,es;q=0.9",
};

// ─── FRAVEGA ───────────────────────────────
console.log("=== FRAVEGA ===");
try {
  const { data } = await axios.get("https://www.fravega.com/l/?keyword=samsung", {
    headers: { ...HEADERS, Referer: "https://www.fravega.com/" },
    maxRedirects: 5,
  });
  const $ = load(data);

  // Try alternate selectors
  const candidates = [
    "article",
    "li[data-test-id]",
    "[data-test-id]",
    ".result-item",
    "[class*='result']",
    "[class*='product']",
    "[class*='card']",
    "[class*='item']",
    "li.sc-",
    "ul li",
  ];
  for (const sel of candidates) {
    const count = $(sel).length;
    if (count > 0 && count < 100) {
      console.log(`  ${sel}: ${count} elements`);
      const first = $(sel).first();
      console.log(`    HTML: ${first.html()?.slice(0, 200)}`);
    }
  }

  // Look for __NEXT_DATA__ SSR JSON
  const nextData = $("script#__NEXT_DATA__").html();
  if (nextData) {
    const json = JSON.parse(nextData);
    console.log("\n  __NEXT_DATA__ keys:", Object.keys(json));
    const pageProps = json?.props?.pageProps;
    if (pageProps) {
      console.log("  pageProps keys:", Object.keys(pageProps));
      // Look for products or search results
      const searchResults = pageProps?.initialData || pageProps?.products || pageProps?.searchResults;
      if (searchResults) {
        const items = Array.isArray(searchResults) ? searchResults : searchResults?.results || searchResults?.items;
        console.log(`  Found ${items?.length} items in __NEXT_DATA__`);
        if (items?.[0]) console.log("  Sample:", JSON.stringify(items[0]).slice(0, 300));
      } else {
        console.log("  pageProps:", JSON.stringify(pageProps).slice(0, 500));
      }
    }
  } else {
    console.log("  No __NEXT_DATA__ found");
  }

  // Check if there's any script with product data
  const scripts = $("script[type='application/json']");
  console.log(`\n  JSON scripts: ${scripts.length}`);

} catch (e) {
  console.log("Error:", e.message);
}

// ─── MERCADOLIBRE ────────────────────────────
console.log("\n=== MERCADOLIBRE ===");
try {
  const { data } = await axios.get("https://listado.mercadolibre.com.ar/samsung", {
    headers: HEADERS,
    maxRedirects: 5,
  });
  const $ = load(data);

  // Check current selectors
  const candidates = [
    ".poly-card",
    ".poly-card--list",
    "li.ui-search-layout__item",
    ".ui-search-result",
    "div[class*='results-item']",
    "article[class*='poly']",
    "[class*='search-result']",
    ".andes-card",
  ];
  for (const sel of candidates) {
    const count = $(sel).length;
    if (count > 0 && count < 200) {
      console.log(`  ${sel}: ${count} elements`);
      if (count < 10) {
        const first = $(sel).first();
        console.log(`    HTML: ${first.html()?.slice(0, 300)}`);
      }
    }
  }

  // Check __PRELOADED_STATE__ for SSR data
  const preloaded = data.match(/window\.__PRELOADED_STATE__\s*=\s*({.+?});?\s*<\/script>/s);
  if (preloaded) {
    const json = JSON.parse(preloaded[1]);
    console.log("\n  __PRELOADED_STATE__ keys:", Object.keys(json).slice(0, 10));
    const results = json?.initialState?.results || json?.results;
    if (results) {
      console.log(`  Results: ${results.length}`);
      if (results[0]) console.log("  Sample:", JSON.stringify(results[0]).slice(0, 200));
    }
  }

  // Check title
  console.log(`  Page title: ${$("title").text()}`);
  console.log(`  HTML length: ${data.length}`);

} catch (e) {
  console.log("Error:", e.message);
}

// ─── ML API with auth-less approach ──────────
console.log("\n=== ML API (no auth) ===");
try {
  const { data } = await axios.get(
    "https://api.mercadolibre.com/sites/MLA/search?q=samsung&limit=5",
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
    },
  );
  console.log(`  Status OK, results: ${data?.results?.length}`);
  if (data?.results?.[0]) {
    console.log("  Sample:", data.results[0].title, data.results[0].price);
  }
} catch (e) {
  console.log("  Error:", e.response?.status, e.message);
}

// ─── ML public search without listing domain ─
console.log("\n=== ML search via api domain ===");
try {
  const { data } = await axios.get(
    "https://api.mercadolibre.com/sites/MLA/search?q=samsung+tv&limit=5&category=MLA1051",
    {
      headers: {
        "User-Agent": "curl/7.68.0",
        Accept: "application/json",
      },
    },
  );
  console.log(`  Status OK, results: ${data?.results?.length}`);
  if (data?.results?.[0]) {
    console.log("  Sample:", data.results[0].title, data.results[0].price);
  }
} catch (e) {
  console.log("  Error:", e.response?.status, JSON.stringify(e.response?.data).slice(0, 200));
}
