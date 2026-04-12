/**
 * Script de inspección: captura network requests de cada tienda
 * Run: node scripts/inspect-stores.mjs
 */

import { chromium } from "playwright";

const STORES = [
  { name: "NALDO",       url: "https://www.naldo.com.ar/busca?ft=samsung" },
  { name: "CETROGAR",    url: "https://www.cetrogar.com.ar/catalogsearch/result/?q=samsung" },
  { name: "FRAVEGA",     url: "https://www.fravega.com/l/?keyword=samsung" },
  { name: "CARREFOUR",   url: "https://www.carrefour.com.ar/search?q=samsung" },
  { name: "MUSIMUNDO",   url: "https://www.musimundo.com/search?Ntt=samsung" },
  { name: "MERCADOLIBRE",url: "https://listado.mercadolibre.com.ar/samsung" },
];

const SKIP_EXT = [".css",".woff",".woff2",".ttf",".ico",".svg",".gif",".png",".jpg",".jpeg",".webp"];
const SKIP_DOM = ["google","facebook","analytics","hotjar","clarity","gtm","doubleclick","adservice","gstatic","recaptcha","cloudflare","amazon-adsystem","bidswitch","tapad","rlcdn","criteo","newrelic","datadog"];

function shouldCapture(url) {
  if (SKIP_EXT.some(ext => url.includes(ext))) return false;
  if (SKIP_DOM.some(d => url.includes(d))) return false;
  return (
    url.includes("api") ||
    url.includes("graphql") ||
    url.includes("search") ||
    url.includes("product") ||
    url.includes("catalog") ||
    url.includes("ajax") ||
    url.includes(".json") ||
    url.includes("busca") ||
    url.includes("segment") ||
    url.includes("braindw") ||
    url.includes("vtex") ||
    url.includes("_v/")
  );
}

async function inspectStore(browser, store) {
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    extraHTTPHeaders: {
      "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
    }
  });
  const page = await context.newPage();

  const captured = [];

  page.on("request", (req) => {
    const url = req.url();
    if (shouldCapture(url)) {
      captured.push({ method: req.method(), url: url.substring(0, 400), type: req.resourceType() });
    }
  });

  // Capturar también respuestas JSON
  const responses = [];
  page.on("response", async (res) => {
    const url = res.url();
    const ct = res.headers()["content-type"] || "";
    if (shouldCapture(url) && ct.includes("json")) {
      try {
        const body = await res.text();
        responses.push({ url: url.substring(0, 300), preview: body.substring(0, 200) });
      } catch (_) {}
    }
  });

  try {
    await page.goto(store.url, { waitUntil: "networkidle", timeout: 25000 });
    await page.waitForTimeout(3000);
  } catch (e) {
    // timeout — usamos lo capturado
  }

  await context.close();

  console.log(`\n${"=".repeat(70)}`);
  console.log(`TIENDA: ${store.name}`);
  console.log(`URL cargada: ${store.url}`);
  console.log(`\n--- Requests API relevantes (${captured.length}) ---`);

  const seen = new Set();
  for (const r of captured) {
    const base = r.url.split("?")[0];
    if (!seen.has(base)) {
      seen.add(base);
      console.log(`  [${r.method}] ${r.url}`);
    }
  }

  if (responses.length > 0) {
    console.log(`\n--- Respuestas JSON (preview) ---`);
    const seenR = new Set();
    for (const r of responses) {
      const base = r.url.split("?")[0];
      if (!seenR.has(base)) {
        seenR.add(base);
        console.log(`  URL: ${r.url}`);
        console.log(`  Preview: ${r.preview}`);
        console.log();
      }
    }
  }
}

async function main() {
  console.log("Iniciando inspección de tiendas con Playwright Chromium...\n");

  const browser = await chromium.launch({ headless: true });

  for (const store of STORES) {
    await inspectStore(browser, store);
  }

  await browser.close();
  console.log("\n\nInspección completa.");
}

main().catch(console.error);
