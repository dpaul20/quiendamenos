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

// Extract all script tags and find the one with productName
const scriptTags = [...html.matchAll(/<script[^>]*>(.*?)<\/script>/gs)];
let bigScript = null;
for (const m of scriptTags) {
  if (m[1].includes("productName")) {
    bigScript = m[1];
    break;
  }
}

if (!bigScript) {
  console.log("No script with productName found");
  process.exit(1);
}

// It might be window.__STATE__ = {...} 
const stateMatch = bigScript.match(/window\.__STATE__\s*=\s*(\{.*)/s);
const scriptMatch = bigScript.match(/^\s*(\{.*)/s);

const raw = stateMatch?.[1] || scriptMatch?.[1];
if (!raw) {
  console.log("Could not find state object. Script start:", bigScript.slice(0, 200));
  process.exit(1);
}

console.log("Script start:", bigScript.slice(0, 200));

// Parse the JSON
let state;
try {
  // Try to find the end of the JSON object
  state = JSON.parse(raw.replace(/;\s*$/, "").trim());
} catch (e) {
  // Try removing trailing JS
  const endIdx = raw.lastIndexOf("}");
  try {
    state = JSON.parse(raw.slice(0, endIdx + 1));
  } catch (e2) {
    console.log("Parse error:", e.message);
    console.log("Raw start:", raw.slice(0, 300));
    process.exit(1);
  }
}

console.log("State keys:", Object.keys(state).slice(0, 20));
console.log("State size:", JSON.stringify(state).length);

// Find product-related keys
const keys = Object.keys(state);
const productKeys = keys.filter((k) => k.includes("Product") || k.includes("product"));
console.log("\nProduct-related keys (first 10):", productKeys.slice(0, 10));

// Find keys with productName data
const productNameKey = keys.find((k) => {
  const v = state[k];
  return v && typeof v === "object" && "productName" in v;
});
console.log("\nFirst key with productName:", productNameKey);
if (productNameKey) {
  console.log("Data:", JSON.stringify(state[productNameKey]).slice(0, 500));
}

// Look for items/product list
const listKeys = keys.filter((k) => {
  const v = state[k];
  return Array.isArray(v) && v.length > 0 && typeof v[0] === "object" && v[0].productName;
});
console.log("\nKeys with product arrays:", listKeys.slice(0, 5));

// Find all keys containing price data
const priceKeys = keys.filter((k) => {
  const v = state[k];
  return v && typeof v === "object" && ("sellingPrice" in v || "listPrice" in v || "Price" in v);
});
console.log("\nKeys with price data (first 5):", priceKeys.slice(0, 5));
if (priceKeys[0]) {
  console.log("Price data:", JSON.stringify(state[priceKeys[0]]).slice(0, 300));
}
