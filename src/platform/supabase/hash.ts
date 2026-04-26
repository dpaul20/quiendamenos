import { createHash } from "crypto";

export function queryHash(q: string): string {
  const normalized = q.trim().toLowerCase().replace(/\s+/g, " ");
  return createHash("sha256").update(normalized).digest("hex").slice(0, 8);
}
