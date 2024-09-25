import client from "./redis";

export async function getCachedData(key: string) {
  try {
    if (process.env.NODE_ENV === "development") {
      return null; // No usar caché en modo desarrollo
    }
    const data = await client.get(key);
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
    await client.set(key, JSON.stringify(data), {
      EX: 60 * 60, // 1 hora
    });
  } catch (error) {
    console.error("Error setting cached data:", error);
  }
}
