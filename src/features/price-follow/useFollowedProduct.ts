"use client";

import { useSyncExternalStore } from "react";

export const FOLLOW_KEY = "qdm:followed";

// Pure helpers — exported for testing
export function getFollowedUrls(storage: Record<string, string>): string[] {
  try {
    const raw = storage[FOLLOW_KEY];
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function setFollowedUrls(
  storage: Record<string, string>,
  urls: string[],
): void {
  storage[FOLLOW_KEY] = JSON.stringify(urls);
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useFollowedProduct(url: string | undefined): {
  isFollowed: boolean;
  toggle: () => void;
} {
  const isFollowed = useSyncExternalStore(
    subscribe,
    () =>
      url
        ? getFollowedUrls(
            localStorage as unknown as Record<string, string>,
          ).includes(url)
        : false,
    () => false,
  );

  const toggle = () => {
    if (typeof window === "undefined" || !url) return;
    const storage = localStorage as unknown as Record<string, string>;
    const urls = getFollowedUrls(storage);
    const next = urls.includes(url)
      ? urls.filter((u) => u !== url)
      : [...urls, url];
    setFollowedUrls(storage, next);
    window.dispatchEvent(new StorageEvent("storage", { key: FOLLOW_KEY }));
  };

  return { isFollowed, toggle };
}
