import axios from "axios";

const H = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" };
const BASE = "https://www.carrefour.com.ar/_v/api/intelligent-search/product_search/v3";

async function inspect(q) {
  const url = `${BASE}?${new URLSearchParams({ query: q, count: 20, from: 0, to: 19, locale: "es-AR", hideUnavailableItems: "true" })}`;
  const { data } = await axios.get(url, { headers: H });
  return { total: data?.recordsFiltered, redirect: data?.redirect, products: data?.products ?? [] };
}

function extractProductsFromApollo(html) {
  const scriptTags = [...html.matchAll(/<script[^>]*>(.*?)<\/script>/gs)];
  let cache = null;
  for (const m of scriptTags) {
    if (m[1].match(/"productName":"/)) {
      try {
        const parsed = JSON.parse(m[1]);
        if (Object.keys(parsed).some((k) => k.startsWith("Product:"))) {
          cache = parsed;
          break;
        }
      } catch {}
    }
  }
  if (!cache) return [];
  const productKeys = Object.keys(cache).filter((k) => k.match(/^Product:sp-\d+-none$/));
  return productKeys.map((key) => {
    const p = cache[key];
    const sp = cache[`$${key}.priceRange.sellingPrice`];
    const price = sp?.lowPrice ?? null;
    let imageUrl = null;
    for (let i = 0; i < 3; i++) {
      const item = cache[`${key}.items({"filter":"ALL_AVAILABLE"}).${i}`];
      if (!item) break;
      const imgRef = item.images?.[0]?.id;
      if (imgRef) {
        const d = cache[imgRef.replace(/^\$/, "")];
        if (d?.imageUrl) { imageUrl = d.imageUrl; break; }
      }
    }
    return { name: p.productName, brand: p.brand, price, url: `https://www.carrefour.com.ar${p.link}`, image: imageUrl };
  });
}

const queries = ["lavavajillas", "lavarropas", "heladera", "microondas", "smart tv", "samsung", "drean"];

for (const q of queries) {
  const { total, redirect, products } = await inspect(q);

  if (total > 0) {
    console.log(`\n"${q}" → IS API: ${total} products`);
    products.slice(0, 2).forEach((p) => console.log(`  - ${p.productName} $${p.priceRange?.sellingPrice?.lowPrice}`));
    continue;
  }

  if (redirect) {
    console.log(`\n"${q}" → IS API redirect: ${redirect}`);
    try {
      const { data: html } = await axios.get(`https://www.carrefour.com.ar${redirect}`, {
        headers: { ...H, Accept: "text/html" },
      });
      const extracted = extractProductsFromApollo(html);
      console.log(`  Apollo cache: ${extracted.length} products`);
      extracted.slice(0, 2).forEach((p) => console.log(`  - ${p.name} | $${p.price}`));
    } catch (e) {
      console.log(`  Redirect fetch error: ${e.message}`);
    }
  } else {
    console.log(`\n"${q}" → IS API: 0 results, no redirect`);
  }
}
