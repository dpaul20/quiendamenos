// No imports from @/features or @/platform/cache — callers inject the revalidation callback.
// Keeps platform/queue as pure infrastructure, reusable across any feature.

export function scheduleRevalidation(revalidate: () => Promise<void>): void {
  setImmediate(() => {
    void (async () => {
      try {
        await revalidate();
      } catch (err) {
        console.error("[queue] SWR revalidation failed:", err);
      }
    })();
  });
}
