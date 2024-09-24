import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // Caché de 1 hora

export function getCachedData(key: string) {
  if (process.env.NODE_ENV === 'development') {
    return null; // No usar caché en modo desarrollo
  }
  return cache.get(key);
}

export function setCachedData(key: string, data: any) {
  if (process.env.NODE_ENV === 'development') {
    return; // No usar caché en modo desarrollo
  }
  cache.set(key, data);
}