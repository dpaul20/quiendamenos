import redis from "./redis";

export async function getCachedData(key: string) {
  try {
    if (process.env.NODE_ENV === "development") {
      return null; // No usar caché en modo desarrollo
    }
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting cached data:", error);
    return null;
  }
}

export async function setCachedData(key: string, data: unknown) {
  try {
    if (process.env.NODE_ENV === "development") {
      return; // No usar caché en modo desarrollo
    }
    await redis.set(key, JSON.stringify(data), "EX", 3600); // Expira en 1 hora
  } catch (error) {
    console.error("Error setting cached data:", error);
  }
}
