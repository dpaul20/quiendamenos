import axios from "axios";

const url =
  "https://www.naldo.com.ar/_v/api/intelligent-search/product_search/v3?query=samsung&count=5&from=0&to=4&locale=es-AR&hideUnavailableItems=true&workspace=master";

const { data } = await axios.get(url, {
  headers: { "User-Agent": "Mozilla/5.0" },
});

// Show top-level keys and first-level nesting
console.log("Top-level keys:", Object.keys(data));
if (data.data) console.log("data.data keys:", Object.keys(data.data));
if (data.products) console.log("data.products:", data.products.length);
if (data.data?.productSearch) console.log("data.data.productSearch keys:", Object.keys(data.data.productSearch));
if (data.data?.productSearch?.products) {
  console.log("data.data.productSearch.products:", data.data.productSearch.products.length);
  console.log("first product:", JSON.stringify(data.data.productSearch.products[0]).slice(0, 300));
}

// Print first 500 chars of raw response
console.log("\nRaw (first 500):", JSON.stringify(data).slice(0, 500));
