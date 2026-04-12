import axios from "axios";

const H = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml",
  "Accept-Language": "es-AR,es;q=0.9",
};

function extractProducts(html) {
  const scriptTags = [...html.matchAll(/<script[^>]*>(.*?)<\/script>/gs)];
  let apolloCache = null;
  for (const m of scriptTags) {
    if (m[1].match(/"productName":"/)) {
      try {
        const parsed = JSON.parse(m[1]);
        if (Object.keys(parsed).some((k) => k.startsWith("Product:"))) {
          apolloCache = parsed;
          break;
        }
      } catch {}
    }
  }
  if (!apolloCache) return [];

  const productKeys = Object.keys(apolloCache).filter((k) => k.match(/^Product:sp-\d+-none$/));
  return productKeys.map((key) => {
    const p = apolloCache[key];
    const sp = apolloCache[`$${key}.priceRange.sellingPrice`];
    const price = sp?.lowPrice ?? null;
    let imageUrl = null;
    for (let i = 0; i < 3; i++) {
      const item = apolloCache[`${key}.items({"filter":"ALL_AVAILABLE"}).${i}`];
      if (!item) break;
      const imgRef = item.images?.[0]?.id;
      if (imgRef) {
        const imgData = apolloCache[imgRef.replace(/^\$/, "")];
        if (imgData?.imageUrl) { imageUrl = imgData.imageUrl; break; }
      }
    }
    return { name: p.productName, brand: p.brand, price, link: `https://www.carrefour.com.ar${p.link}`, image: imageUrl };
  });
}

const queries = ["lavavajillas", "samsung", "heladera", "lavarropas"];

for (const q of queries) {
  const url = `https://www.carrefour.com.ar/electro-y-tecnologia/busca?q=${encodeURIComponent(q)}`;
  try {
    const { data: html } = await axios.get(url, { headers: H });
    const products = extractProducts(html);
    console.log(`\n[${q}] ${products.length} results from electro/busca`);
    products.slice(0, 3).forEach((p) => console.log(`  - ${p.name} | $${p.price}`));
  } catch (e) {
    console.log(`\n[${q}] ERROR: ${e.response?.status ?? e.message}`);
  }
}
