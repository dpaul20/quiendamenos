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

const scriptTags = [...html.matchAll(/<script[^>]*>(.*?)<\/script>/gs)];
let apolloCache = null;
for (const m of scriptTags) {
  if (m[1].match(/"productName":"Lavavajillas/)) {
    apolloCache = JSON.parse(m[1]);
    break;
  }
}

if (!apolloCache) { console.log("not found"); process.exit(1); }

console.log("Apollo cache keys (first 30):", Object.keys(apolloCache).slice(0, 30));

// Get first product key
const productKey = Object.keys(apolloCache).find((k) => k.startsWith("Product:"));
console.log("\nFirst product key:", productKey);
const product = apolloCache[productKey];
console.log("Product fields:", Object.keys(product));
console.log("Product data:", JSON.stringify(product).slice(0, 600));

// Understand the price reference format
// priceRange.sellingPrice is like {type:"id", id:"$...", typename:"PriceRange"}
const priceRef = product?.priceRange?.sellingPrice;
console.log("\npriceRange.sellingPrice ref:", JSON.stringify(priceRef));

// The actual price key in cache (Apollo stores it with the $ prefix)
if (priceRef?.id) {
  const priceKey = priceRef.id.replace(/^\$/, ""); // remove leading $
  console.log("Price cache key (without $):", priceKey);
  const priceData = apolloCache[priceKey];
  console.log("Price data:", JSON.stringify(priceData));
  
  // lowPrice ref
  if (priceData?.lowPrice?.id) {
    const lowKey = priceData.lowPrice.id.replace(/^\$/, "");
    console.log("Low price data:", JSON.stringify(apolloCache[lowKey]));
  } else {
    console.log("lowPrice value:", priceData?.lowPrice);
  }
}

// Get all Product keys
const allProductKeys = Object.keys(apolloCache).filter((k) => k.match(/^Product:sp-\d+-none$/));
console.log("\n\nAll Product keys:", allProductKeys.length);

// Extract full product list
console.log("\n=== All products ===");
for (const key of allProductKeys) {
  const p = apolloCache[key];
  const name = p.productName;
  const link = p.link;
  const brand = p.brand;

  // Get price
  let price = null;
  const sellingPriceRef = p.priceRange?.sellingPrice;
  if (sellingPriceRef?.id) {
    const rangeKey = sellingPriceRef.id.replace(/^\$/, "");
    const rangeData = apolloCache[rangeKey];
    // The lowPrice might be direct or another reference
    if (rangeData?.lowPrice?.id) {
      const lowKey = rangeData.lowPrice.id.replace(/^\$/, "");
      const lowData = apolloCache[lowKey];
      price = lowData;
    } else {
      price = rangeData?.lowPrice;
    }
  }

  // Get image
  const imgRef = p.items?.[0]?.images?.[0];
  let imageUrl = null;
  if (imgRef?.id) {
    const imgKey = imgRef.id.replace(/^\$/, "");
    const imgData = apolloCache[imgKey];
    imageUrl = imgData?.imageUrl;
  }

  console.log(`\n${name}`);
  console.log(`  brand: ${brand}`);
  console.log(`  price: ${JSON.stringify(price)}`);
  console.log(`  link: ${link}`);
  console.log(`  image: ${imageUrl}`);
}
