import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // Caché de 1 hora

export function getCachedData(key) {
  return cache.get(key);
}

export function setCachedData(key, data) {
  cache.set(key, data);
}