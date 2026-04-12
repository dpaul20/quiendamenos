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

// Find ALL script tags with actual product data (productName + actual name)
const scriptTags = [...html.matchAll(/<script[^>]*>(.*?)<\/script>/gs)];
console.log("Total script tags:", scriptTags.length);

for (let i = 0; i < scriptTags.length; i++) {
  const content = scriptTags[i][1];
  // Look for actual product names (not just the key "productName")
  if (content.match(/"productName":"Lavavajillas/)) {
    console.log(`\n=== Script ${i} has actual product names ===`);
    console.log("Length:", content.length);
    console.log("Tag:", scriptTags[i][0].slice(0, 120));
    console.log("Content start:", content.slice(0, 200));

    // Try to determine structure
    const productMatches = content.match(/"productName":"[^"]+"/g);
    console.log("Products found:", productMatches?.length);
    productMatches?.forEach((m) => console.log(" -", m));

    // Show price context
    const priceIdx = content.indexOf('"sellingPrice"');
    if (priceIdx >= 0) {
      console.log("\nPrice context:", content.slice(priceIdx, priceIdx + 200));
    }

    // Show link context
    const linkIdx = content.indexOf('"link":"');
    if (linkIdx >= 0) {
      console.log("\nLink context:", content.slice(linkIdx, linkIdx + 200));
    }

    // Show image context
    const imgIdx = content.indexOf('"imageUrl"');
    if (imgIdx < 0) {
      const altIdx = content.indexOf('"image"');
      console.log("\nImage context:", content.slice(altIdx, altIdx + 200));
    } else {
      console.log("\nImageUrl context:", content.slice(imgIdx, imgIdx + 200));
    }
  }
}
