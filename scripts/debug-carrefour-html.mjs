import axios from "axios";

const H = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml",
  "Accept-Language": "es-AR,es;q=0.9",
};

const { data: html } = await axios.get(
  "https://www.carrefour.com.ar/electro-y-tecnologia/lavado/lavavajillas",
  { headers: H },
);

console.log("HTML size:", html.length);

// Find all JSON script tags
const scriptMatches = [...html.matchAll(/<script[^>]*type="application\/json"[^>]*>(.*?)<\/script>/gs)];
console.log("JSON script tags found:", scriptMatches.length);

for (let i = 0; i < scriptMatches.length; i++) {
  const content = scriptMatches[i][1];
  if (content.includes("productName") || content.includes("Producto")) {
    console.log(`\nScript ${i} has productName, length=${content.length}`);
    try {
      const json = JSON.parse(content);
      const str = JSON.stringify(json);
      const products = str.match(/"productName":"[^"]+"/g);
      console.log("Products:", products?.slice(0, 5));
      const prices = str.match(/"sellingPrice":\d+/g);
      console.log("Prices:", prices?.slice(0, 3));
    } catch (e) {
      console.log("Parse error:", e.message.slice(0, 60));
    }
  }
}

// Search for product-like JSON in the full HTML
const productNameMatches = html.match(/"productName":"[^"]+"/g);
console.log("\nproductName occurrences:", productNameMatches?.length);
console.log("First 5:", productNameMatches?.slice(0, 5));

// Look for itemsPerPage or totalProducts
const totalMatch = html.match(/totalProducts[^,}]{0,60}/g);
console.log("\ntotalProducts:", totalMatch?.slice(0, 3));

// Look for API calls in inline scripts
const isApiMatch = html.match(/intelligent-search[^"']{0,150}/g);
console.log("\nIS API refs:", isApiMatch?.slice(0, 3));

// Look for product-list data
const plpMatch = html.match(/plp[^"'<]{0,80}/gi);
console.log("\nPLP refs:", plpMatch?.slice(0, 3));

// Look for window.__state__ or similar
const stateMatch = html.match(/window\.[A-Z_]{3,20}\s*=\s*\{[^;]{0,200}/g);
console.log("\nwindow globals:", stateMatch?.slice(0, 2));
