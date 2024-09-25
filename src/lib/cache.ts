import redis from "./redis";

export async function getCachedData(key: string) {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting cached data:", error);
    return null;
  }
}

export async function setCachedData(key: string, data: unknown) {
  try {
    await redis.set(key, JSON.stringify(data), "EX", 3600); // Expira en 1 hora
  } catch (error) {
    console.error("Error setting cached data:", error);
  }
}
