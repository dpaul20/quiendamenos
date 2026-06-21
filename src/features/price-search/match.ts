import type { Product } from "@/types/product.d";

export interface CompareOffer {
  store: string;
  price: number;
  url: string;
  installment?: number;
  stock: boolean;
}

const STOP_WORDS = new Set([
  "de",
  "la",
  "el",
  "los",
  "las",
  "y",
  "en",
  "con",
  "para",
  "a",
  "e",
]);

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(name: string): { numeric: string[]; text: string[] } {
  const normalized = normalize(name);
  const parts = normalized.split(" ");
  const numeric: string[] = [];
  const text: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const token = parts[i];
    if (/\d/.test(token)) {
      // Join with next token if it looks like a unit (letters only, no digits)
      const next = parts[i + 1];
      if (next && /^[a-z]+$/.test(next) && next.length <= 2) {
        numeric.push(token + next);
        i++;
      } else {
        numeric.push(token);
      }
    } else if (/^[a-z]{2,}$/.test(token) && !STOP_WORDS.has(token)) {
      text.push(token);
    }
  }

  return { numeric, text };
}

export function matchOffers(
  clicked: Product,
  allProducts: Product[],
): CompareOffer[] {
  const clickedName = clicked.name ?? "";
  const clickedTokens = tokenize(clickedName);

  const offers: CompareOffer[] = [];

  for (const candidate of allProducts) {
    // Always include the clicked product itself
    if (candidate.url === clicked.url) {
      offers.push({
        store: candidate.from,
        price: candidate.price ?? Infinity,
        url: candidate.url ?? "",
        installment: candidate.installment,
        stock: true,
      });
      continue;
    }

    // Exclude same store
    if (candidate.from === clicked.from) continue;

    const candidateName = candidate.name ?? "";
    const candidateTokens = tokenize(candidateName);

    // All clicked numeric tokens must be present in candidate numeric tokens
    const candidateNumericSet = new Set(candidateTokens.numeric);
    const allNumericMatch = clickedTokens.numeric.every((t) =>
      candidateNumericSet.has(t),
    );
    if (clickedTokens.numeric.length > 0 && !allNumericMatch) continue;

    // At least 2 text tokens must overlap
    const candidateTextSet = new Set(candidateTokens.text);
    const textOverlap = clickedTokens.text.filter((t) =>
      candidateTextSet.has(t),
    ).length;
    if (textOverlap < 2) continue;

    offers.push({
      store: candidate.from,
      price: candidate.price ?? Infinity,
      url: candidate.url ?? "",
      installment: candidate.installment,
      stock: true,
    });
  }

  // Sort by price ascending (Infinity sorts last)
  offers.sort((a, b) => a.price - b.price);

  return offers;
}
