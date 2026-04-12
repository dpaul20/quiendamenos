import { readFileSync, existsSync } from "fs";
import path from "path";

export interface StoreSelectors {
  container: string;
  name: string;
  price: string;
  image: string;
  url: string;
  installment?: string;
}

export interface StoreConfig {
  key: string;
  displayName: string;
  parser: "cheerio";
  url: string;
  selectors: StoreSelectors;
}

const CONFIG_PATH = path.join(
  process.cwd(),
  "src",
  "stores",
  "config",
  "stores.config.json",
);

const REQUIRED_FIELDS = ["key", "displayName", "parser", "url"] as const;
const REQUIRED_SELECTORS = ["container", "name", "price"] as const;

function validateStore(store: unknown, index: number): StoreConfig {
  if (typeof store !== "object" || store === null) {
    throw new Error(`[loader] stores[${index}] must be an object`);
  }
  const s = store as Record<string, unknown>;
  for (const field of REQUIRED_FIELDS) {
    if (!s[field]) {
      throw new Error(
        `[loader] stores[${index}] missing required field: "${field}"`,
      );
    }
  }
  const selectors = s.selectors;
  if (typeof selectors !== "object" || selectors === null) {
    throw new Error(`[loader] stores[${index}] missing "selectors"`);
  }
  const sel = selectors as Record<string, unknown>;
  for (const field of REQUIRED_SELECTORS) {
    if (!sel[field]) {
      throw new Error(
        `[loader] stores[${index}].selectors missing required field: "${field}"`,
      );
    }
  }
  return store as StoreConfig;
}

export function loadStores(configPath = CONFIG_PATH): StoreConfig[] {
  if (!existsSync(configPath)) return [];

  let raw: string;
  try {
    raw = readFileSync(configPath, "utf-8");
  } catch {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `[loader] stores.config.json has invalid JSON: ${(err as Error).message}`,
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray((parsed as Record<string, unknown>).stores)
  ) {
    throw new Error(
      '[loader] stores.config.json must have a "stores" array at root',
    );
  }

  return (parsed as { stores: unknown[] }).stores.map((s, i) =>
    validateStore(s, i),
  );
}
