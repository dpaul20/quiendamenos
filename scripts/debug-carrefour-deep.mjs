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
let bigScript = null;
for (const m of scriptTags) {
  if (m[1].includes("productName")) {
    bigScript = m[1];
    break;
  }
}

const state = JSON.parse(bigScript);
const allKeys = Object.keys(state);

// Deep search for keys with productName
function findProductPaths(obj, path = "", maxDepth = 5) {
  if (maxDepth <= 0) return;
  if (!obj || typeof obj !== "object") return;

  if ("productName" in obj) {
    console.log(`Found productName at path: ${path}`);
    console.log("Keys at this level:", Object.keys(obj).join(", "));
    console.log("productName:", obj.productName);
    if (obj.items) {
      console.log("items:", JSON.stringify(obj.items).slice(0, 200));
    }
    return;
  }

  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item && typeof item === "object" && "productName" in item) {
          console.log(`Found productName in array at path: ${path}.${k}[${i}]`);
          console.log("Keys:", Object.keys(item).join(", "));
          console.log("productName:", item.productName);
          console.log("price data:", item.priceRange ? JSON.stringify(item.priceRange).slice(0, 200) : "no priceRange");
          console.log("link:", item.link);
          console.log("items (first):", JSON.stringify(item.items?.[0]).slice(0, 300));
        }
      });
    } else if (v && typeof v === "object") {
      findProductPaths(v, `${path}.${k}`, maxDepth - 1);
    }
  }
}

// Check specific known VTEX IO state keys
console.log("=== Checking specific state keys ===");
const keysToCheck = [
  "queryData",
  "contentResponse",
  "components",
  "blocksTree",
  "blocks",
];

for (const key of keysToCheck) {
  if (state[key]) {
    const val = state[key];
    const str = JSON.stringify(val);
    if (str.includes("productName")) {
      console.log(`\n${key} contains productName! Size: ${str.length}`);
      // Find deeper
      findProductPaths(val, key, 6);
      break;
    } else {
      console.log(`${key}: no productName`);
    }
  }
}

// Also check ROOT_QUERY (Apollo-style)
const rootQueryKey = Object.keys(state).find((k) => k.includes("ROOT_QUERY") || k.includes("queryData"));
console.log("\nROOT_QUERY key:", rootQueryKey);

// Brute force: find the key containing productName
for (const [k, v] of Object.entries(state)) {
  if (v && typeof v === "object") {
    const str = JSON.stringify(v);
    if (str.includes("productName")) {
      console.log(`\nKey "${k}" contains productName (size: ${str.length})`);
      if (Array.isArray(v)) {
        console.log("Is array, length:", v.length);
        v.slice(0, 2).forEach((item) => {
          if (item?.productName) console.log("  Product:", item.productName);
        });
      } else {
        console.log("Type: object, keys:", Object.keys(v).slice(0, 10).join(", "));
      }
    }
  }
}
