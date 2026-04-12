/**
 * Deep inspect Fravega Apollo state and MercadoLibre poly-card structure
 * Run: node scripts/inspect-data.mjs
 */
import axios from "axios";
import { load } from "cheerio";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "es-AR,es;q=0.9",
};

// ─── FRAVEGA — Apollo State ────────────────────
console.log("=== FRAVEGA Apollo State ===");
try {
  const { data } = await axios.get("https://www.fravega.com/l/?keyword=samsung", {
    headers: { ...HEADERS, Referer: "https://www.fravega.com/" },
    maxRedirects: 5,
  });
  const $ = load(data);
  const nextData = JSON.parse($("script#__NEXT_DATA__").html());
  const apolloState = nextData?.props?.pageProps?.__APOLLO_STATE__;

  if (apolloState) {
    const keys = Object.keys(apolloState);
    console.log(`Apollo state keys count: ${keys.length}`);
    // Find product-like keys
    const productKeys = keys.filter(
      (k) =>
        k.startsWith("Product:") ||
        k.startsWith("SearchProduct:") ||
        k.startsWith("ElasticProduct:") ||
        k.toLowerCase().includes("product"),
    );
    console.log(`Product-like keys: ${productKeys.length}`);
    if (productKeys.length > 0) {
      console.log("First product key:", productKeys[0]);
      console.log("Sample:", JSON.stringify(apolloState[productKeys[0]]).slice(0, 500));
    }

    // Find search result keys
    const searchKeys = keys.filter(
      (k) =>
        k.startsWith("Search") ||
        k.startsWith("SearchResult") ||
        k.toLowerCase().includes("search"),
    );
    console.log(`\nSearch-like keys: ${searchKeys.length}`);
    // Show all search keys
    searchKeys.slice(0, 5).forEach((k) => {
      console.log(`  Key: ${k}`);
      console.log(`  Value: ${JSON.stringify(apolloState[k]).slice(0, 300)}`);
    });

    // Try ROOT_QUERY
    if (apolloState.ROOT_QUERY) {
      console.log("\nROOT_QUERY keys:", Object.keys(apolloState.ROOT_QUERY).slice(0, 10));
      // Find search query key
      const queryKeys = Object.keys(apolloState.ROOT_QUERY).filter(
        (k) => k.includes("search") || k.includes("product") || k.includes("listing"),
      );
      console.log("Query keys matching:", queryKeys.slice(0, 5));
      if (queryKeys[0]) {
        const qk = queryKeys[0];
        console.log(`ROOT_QUERY[${qk}]:`, JSON.stringify(apolloState.ROOT_QUERY[qk]).slice(0, 400));
      }
    }
  } else {
    console.log("No __APOLLO_STATE__ found");
    console.log("pageProps:", JSON.stringify(nextData?.props?.pageProps).slice(0, 300));
  }

  // Try article selector
  const articles = $("article").map((_, el) => {
    const html = $(el).html()?.slice(0, 1000);
    return html;
  }).get();
  console.log(`\nArticle count: ${articles.length}`);
  if (articles[0]) {
    console.log("First article HTML (1000 chars):", articles[0]);
  }
} catch (e) {
  console.log("Error:", e.message, e.stack?.slice(0, 200));
}

// ─── MERCADOLIBRE — poly-card structure ───────
console.log("\n=== MERCADOLIBRE poly-card ===");
try {
  const { data } = await axios.get("https://listado.mercadolibre.com.ar/samsung", {
    headers: HEADERS,
    maxRedirects: 5,
  });
  const $ = load(data);

  // Check exact class names
  const firstCard = $(".poly-card").first();
  if (firstCard.length) {
    console.log("First .poly-card classes:", firstCard.attr("class"));
    console.log("Full HTML (2000):", firstCard.html()?.slice(0, 2000));
  }

  // Try to extract product info from first card
  const items = $(".poly-card").map((_, el) => {
    const name =
      $(el).find(".poly-component__title").text().trim() ||
      $(el).find("[class*='title']").first().text().trim() ||
      $(el).find("h2,h3").first().text().trim();

    // Price: try different price selectors
    const price =
      $(el).find(".andes-money-amount__fraction").first().text().trim() ||
      $(el).find("[class*='price']").first().text().trim();

    const image =
      $(el).find("img").attr("data-src") ||
      $(el).find("img").attr("src");

    const url =
      $(el).find("a.poly-component__title").attr("href") ||
      $(el).find("a[href*='mercadolibre']").first().attr("href") ||
      $(el).find("a").first().attr("href");

    return { name, price, image: image?.slice(0, 80), url: url?.slice(0, 100) };
  }).get().filter((p) => p.name).slice(0, 3);

  console.log(`\nExtracted ${items.length} items (first 3):`);
  items.forEach((p, i) => console.log(`  ${i + 1}.`, JSON.stringify(p)));
} catch (e) {
  console.log("Error:", e.message);
}
