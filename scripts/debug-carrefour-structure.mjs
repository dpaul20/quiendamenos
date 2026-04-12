import axios from "axios";
import { load } from "cheerio";

const H = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml",
  "Accept-Language": "es-AR,es;q=0.9",
};

const { data: html } = await axios.get(
  "https://www.carrefour.com.ar/electro-y-tecnologia/lavado/lavavajillas",
  { headers: H },
);

// Find context around productName
const idx = html.indexOf('"productName":"Lavavajillas');
console.log("Context around first productName (500 chars before):");
console.log(html.slice(Math.max(0, idx - 200), idx + 300));

// Find JSON-LD structured data
console.log("\n=== JSON-LD blocks ===");
const jsonldMatches = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
console.log("JSON-LD blocks:", jsonldMatches.length);
for (const m of jsonldMatches.slice(0, 3)) {
  const content = m[1];
  if (content.includes("Product") || content.includes("lavavajillas")) {
    console.log("JSON-LD with Product/lavavajillas:", content.slice(0, 400));
  }
}

// Find the inline state/data object
console.log("\n=== Inline script data ===");
const scriptTags = [...html.matchAll(/<script[^>]*>(.*?)<\/script>/gs)];
console.log("Total script tags:", scriptTags.length);

for (let i = 0; i < scriptTags.length; i++) {
  const content = scriptTags[i][1];
  if (content.includes("productName")) {
    console.log(`\nScript ${i} has productName, length=${content.length}`);
    // Try to find the JSON structure
    const start = content.indexOf('"productName"') - 200;
    console.log("Context:", content.slice(Math.max(0, start), start + 500));
    break;
  }
}

// Cheerio approach - look for product cards
const $ = load(html);
console.log("\n=== Cheerio selectors ===");

// Common VTEX product card selectors
const selectors = [
  "article.vtex-product-summary",
  "[class*='productSummary']",
  "[class*='galleryItem']",
  "[class*='ProductCard']",
  "[class*='product-summary']",
  "section[class*='gallery']",
  "li[class*='gallery']",
  "div[class*='vtex-search']",
];

for (const sel of selectors) {
  const count = $(sel).length;
  if (count > 0) {
    console.log(`"${sel}": ${count} elements`);
    const first = $(sel).first();
    console.log("  First classes:", first.attr("class")?.slice(0, 80));
    console.log("  First text:", first.text().trim().slice(0, 100));
  }
}

// Look for product name elements
const nameEl = $("[class*='productName'], [class*='product-name']");
console.log("\nproductName elements:", nameEl.length);
nameEl.slice(0, 3).each((_, el) => console.log("  -", $(el).text().trim().slice(0, 80)));

// BuyButton / ProductImage
const buyBtn = $("[class*='buyButton'], [class*='buy-button']");
console.log("\nbuyButton elements:", buyBtn.length);
