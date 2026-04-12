import axios from "axios";

const H = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml",
  "Accept-Language": "es-AR,es;q=0.9",
};

// Test different search URL patterns on Carrefour
const urls = [
  "https://www.carrefour.com.ar/s?q=lavavajillas",
  "https://www.carrefour.com.ar/busca/?q=lavavajillas",
  "https://www.carrefour.com.ar/search?q=lavavajillas",
  "https://www.carrefour.com.ar/electro-y-tecnologia?q=lavavajillas",
];

for (const url of urls) {
  try {
    const { data: html, status, request } = await axios.get(url, { headers: H, maxRedirects: 5 });
    const productMatches = html.match(/"productName":"[^"]+"/g);
    const finalUrl = request.path;
    console.log(`✅ ${url.split("carrefour.com.ar")[1]}`);
    console.log(`   Final path: ${finalUrl}`);
    console.log(`   HTML size: ${html.length}`);
    console.log(`   Products: ${productMatches?.length ?? 0}`);
    if (productMatches?.length) {
      console.log(`   First 2:`, productMatches.slice(0, 2));
    }
  } catch (e) {
    console.log(`❌ ${url}: ${e.response?.status ?? e.message}`);
  }
  console.log();
}

// Also try samsung on the search page to see if it works
console.log("=== Samsung on search page ===");
try {
  const { data: html } = await axios.get("https://www.carrefour.com.ar/s?q=samsung", { headers: H });
  const products = html.match(/"productName":"[^"]+"/g);
  console.log("samsung products:", products?.length);
  products?.slice(0, 3).forEach((p) => console.log(" -", p));
} catch (e) {
  console.log("Error:", e.message);
}
