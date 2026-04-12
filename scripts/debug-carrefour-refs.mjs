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

const productKey = "Product:sp-1752002-none";
const product = apolloCache[productKey];

// Show priceRange field raw value
console.log("priceRange raw:", JSON.stringify(product.priceRange));

// Navigate using the $ key directly
const priceRangeKey = `$${productKey}.priceRange`;
const priceRange = apolloCache[priceRangeKey];
console.log("\npriceRange data:", JSON.stringify(priceRange));

const sellingPriceKey = `$${productKey}.priceRange.sellingPrice`;
const sellingPrice = apolloCache[sellingPriceKey];
console.log("\nsellingPrice data:", JSON.stringify(sellingPrice));

// The actual lowPrice
if (sellingPrice?.lowPrice?.id) {
  const lowKey = sellingPrice.lowPrice.id.replace(/^\$/, "");
  console.log("\nlowPrice ref id:", sellingPrice.lowPrice.id);
  console.log("lowPrice data:", JSON.stringify(apolloCache[lowKey]));
} else {
  console.log("\nsellingPrice.lowPrice:", JSON.stringify(sellingPrice?.lowPrice));
}

// Try items key (note the filter suffix)
const itemsKey = `items({"filter":"ALL_AVAILABLE"})`;
const itemsRef = product[itemsKey];
console.log("\nitems ref:", JSON.stringify(itemsRef)?.slice(0, 200));

// Also inspect the items cache key
const itemsCacheKey = `${productKey}.items({"filter":"ALL_AVAILABLE"}).0`;
const item0 = apolloCache[itemsCacheKey];
console.log("\nitem 0:", JSON.stringify(item0)?.slice(0, 300));

// Look for image
if (item0) {
  const imgKey = item0.images?.[0]?.id ? item0.images[0].id.replace(/^\$/, "") : null;
  if (imgKey) {
    const imgData = apolloCache[imgKey];
    console.log("\nimage data:", JSON.stringify(imgData));
  }
}

// Build a proper extractor
console.log("\n\n=== Proper extraction ===");
const allProductKeys = Object.keys(apolloCache).filter((k) => k.match(/^Product:sp-\d+-none$/));
console.log("Total products:", allProductKeys.length);

for (const key of allProductKeys) {
  const p = apolloCache[key];
  const name = p.productName;
  const link = `https://www.carrefour.com.ar${p.link}`;
  const brand = p.brand;

  // Price: $key.priceRange.sellingPrice -> lowPrice
  const sp = apolloCache[`$${key}.priceRange.sellingPrice`];
  let lowPrice = null;
  if (sp?.lowPrice?.id) {
    const lp = apolloCache[sp.lowPrice.id.replace(/^\$/, "")];
    lowPrice = lp;
  } else {
    lowPrice = sp?.lowPrice;
  }

  // Image via items
  let imageUrl = null;
  for (let i = 0; i < 5; i++) {
    const item = apolloCache[`${key}.items({"filter":"ALL_AVAILABLE"}).${i}`];
    if (!item) break;
    const img0Ref = item.images?.[0]?.id;
    if (img0Ref) {
      const imgData = apolloCache[img0Ref.replace(/^\$/, "")];
      if (imgData?.imageUrl) { imageUrl = imgData.imageUrl; break; }
    }
  }

  console.log(`${name} | brand=${brand} | price=${JSON.stringify(lowPrice)} | url=${link.slice(0, 60)}`);
  if (imageUrl) console.log(`  image=${imageUrl.slice(0, 80)}`);
}
