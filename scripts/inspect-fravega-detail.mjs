/**
 * Detailed Fravega article HTML and GraphQL test
 * Run: node scripts/inspect-fravega-detail.mjs
 */
import axios from "axios";
import { load } from "cheerio";
import { writeFileSync } from "fs";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "es-AR,es;q=0.9",
};

// ─── Dump full first article HTML ─────────────
console.log("=== FRAVEGA article HTML ===");
try {
  const { data } = await axios.get("https://www.fravega.com/l/?keyword=samsung", {
    headers: { ...HEADERS, Referer: "https://www.fravega.com/" },
    maxRedirects: 5,
  });
  const $ = load(data);

  // Dump full first article
  const firstArticle = $("article").first().html();
  console.log("Full first article:\n", firstArticle?.slice(0, 5000));
  writeFileSync("scripts/fravega-article.html", firstArticle || "");
  console.log("\n✅ Written to scripts/fravega-article.html");

  // Try data-test-id on all elements inside articles
  const testIds = new Set();
  $("article [data-test-id]").each((_, el) => testIds.add($(el).attr("data-test-id")));
  console.log("\ndata-test-id values in articles:", [...testIds]);

  // Try stable text patterns
  $("article").each((i, article) => {
    const el = $(article);
    const url = el.find("a[rel='bookmark'][href^='/p/']").first().attr("href");
    const allText = el.text().replace(/\s+/g, " ").trim().slice(0, 200);
    const img = el.find("img[src*='images.fravega.com/f300/']").attr("src");
    console.log(`\nArticle ${i}: url=${url}`);
    console.log(`  img=${img?.slice(0, 80)}`);
    console.log(`  text="${allText}"`);
  });
} catch (e) {
  console.log("Error:", e.message);
}

// ─── GraphQL with correct types ───────────────
console.log("\n=== FRAVEGA GraphQL (correct type) ===");
try {
  const query = `
    query GetItems($filtering: ItemFilteringInput, $limit: Int, $offset: Int, $orderBy: String) {
      items(filtering: $filtering, limit: $limit, offset: $offset, orderBy: $orderBy) {
        id
        name
        sku
        url
        currentPrice {
          currentPrice
          bestPrice
        }
        pictures {
          url
        }
        brand {
          name
        }
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
    limit: 20,
    offset: 0,
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
  if (data?.errors) {
    console.log("GraphQL errors:", JSON.stringify(data.errors).slice(0, 500));
  } else {
    const items = data?.data?.items;
    console.log(`Got ${items?.length} items`);
    if (items?.[0]) console.log("First:", JSON.stringify(items[0]).slice(0, 400));
  }
} catch (e) {
  console.log("Error:", e.response?.status, JSON.stringify(e.response?.data).slice(0, 400));
}
