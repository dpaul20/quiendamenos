/**
 * Script temporal para inspeccionar las APIs de cada tienda
 * Intercepta network requests durante una búsqueda
 * Run: npx ts-node scripts/inspect-stores.ts
 */

import { chromium } from "playwright";

const STORES = [
  {
    name: "NALDO",
    url: "https://www.naldo.com.ar/busca?ft=samsung",
  },
  {
    name: "CETROGAR",
    url: "https://www.cetrogar.com.ar/catalogsearch/result/?q=samsung",
  },
  {
    name: "FRAVEGA",
    url: "https://www.fravega.com/l/?keyword=samsung",
  },
  {
    name: "CARREFOUR",
    url: "https://www.carrefour.com.ar/search?q=samsung",
  },
  {
    name: "MUSIMUNDO",
    url: "https://www.musimundo.com/search?Ntt=samsung",
  },
  {
    name: "MERCADOLIBRE",
    url: "https://listado.mercadolibre.com.ar/samsung",
  },
];

const SKIP_EXTENSIONS = [
  ".css",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".ico",
  ".svg",
  ".gif",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];
const SKIP_DOMAINS = [
  "google",
  "facebook",
  "analytics",
  "hotjar",
  "clarity",
  "gtm",
  "doubleclick",
  "adservice",
  "gstatic",
  "recaptcha",
];

function shouldCapture(url: string): boolean {
  if (SKIP_EXTENSIONS.some((ext) => url.includes(ext))) return false;
  if (SKIP_DOMAINS.some((d) => url.includes(d))) return false;
  const isHtml =
    url.endsWith("/") || (!url.includes("?") && !url.includes("."));
  const isApiLike =
    url.includes("api") ||
    url.includes("graphql") ||
    url.includes("search") ||
    url.includes("product") ||
    url.includes("catalog") ||
    url.includes("ajax") ||
    url.includes(".json") ||
    url.includes("busca") ||
    url.includes("segment") ||
    url.includes("braindw");
  return isApiLike && !isHtml;
}

async function inspectStore(
  browser: ReturnType<typeof chromium.launch> extends Promise<infer T>
    ? T
    : never,
  store: { name: string; url: string }
) {
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  const captured: { method: string; url: string; type: string }[] = [];

  page.on("request", (req) => {
    const url = req.url();
    if (shouldCapture(url)) {
      captured.push({
        method: req.method(),
        url: url.substring(0, 300),
        type: req.resourceType(),
      });
    }
  });

  try {
    await page.goto(store.url, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(2000);
  } catch (e) {
    // timeout ok, capturamos lo que hay
  }

  await context.close();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`TIENDA: ${store.name}`);
  console.log(`URL: ${store.url}`);
  console.log(`Requests capturados: ${captured.length}`);
  console.log("-".repeat(60));

  // Deduplicate by base URL (sin query params para ver patrones)
  const seen = new Set<string>();
  for (const r of captured) {
    const base = r.url.split("?")[0];
    if (!seen.has(base)) {
      seen.add(base);
      console.log(`[${r.method}] ${r.url}`);
    }
  }
}

async function main() {
  console.log("Iniciando inspección de tiendas...\n");

  const browser = await chromium.launch({
    headless: true,
  });

  for (const store of STORES) {
    await inspectStore(browser, store);
  }

  await browser.close();
  console.log("\n\nInspección completa.");
}

main().catch(console.error);
