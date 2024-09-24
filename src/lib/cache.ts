import redis from "./redis";

export async function getCachedData(key: string) {
  if (process.env.NODE_ENV === "development") {
    return null; // No usar caché en modo desarrollo
  }
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function setCachedData(key: string, data: any) {
  if (process.env.NODE_ENV === "development") {
    return; // No usar caché en modo desarrollo
  }
  await redis.set(key, JSON.stringify(data), "EX", 3600); // Expira en 1 hora
}
