/**
 * Pruebas para la Estrategia de Exponential Backoff
 */

import {
  exponentialBackoff,
  withBackoff,
  calculateDelay,
  DEFAULT_BACKOFF_CONFIG,
} from '@/platform/backoff';

describe('Estrategia de Backoff', () => {
  describe('calculateDelay', () => {
    it('debería calcular los delays correctos sin jitter', () => {
      const config = { baseDelay: 1000, multiplier: 2, maxDelay: 32000 };

      // Intento 0: 1000ms
      const delay0 = calculateDelay(0, config);
      expect(delay0).toBeGreaterThanOrEqual(1000);
      expect(delay0).toBeLessThan(2000); // Con jitter

      // Intento 1: 2000ms
      const delay1 = calculateDelay(1, config);
      expect(delay1).toBeGreaterThanOrEqual(2000);
      expect(delay1).toBeLessThan(3000);

      // Intento 2: 4000ms
      const delay2 = calculateDelay(2, config);
      expect(delay2).toBeGreaterThanOrEqual(4000);
      expect(delay2).toBeLessThan(5000);
    });

    it('debería limitar el delay en maxDelay', () => {
      const config = { baseDelay: 1000, multiplier: 2, maxDelay: 5000 };

      // Intento 5: sería 32000ms pero limitado a 5000ms
      const delay5 = calculateDelay(5, config);
      expect(delay5).toBeLessThanOrEqual(6000); // 5000 + max jitter
    });

    it('debería usar configuración por defecto cuando no se proporciona', () => {
      const delay = calculateDelay(1); // Usa valores por defecto
      expect(delay).toBeGreaterThanOrEqual(4000); // 2000 * 2^1
      expect(delay).toBeLessThan(5000); // Con jitter
    });
  });

  describe('exponentialBackoff', () => {
    it('debería tener éxito en el primer intento', async () => {
      const mockFn = jest.fn().mockResolvedValueOnce('éxito');

      const result = await exponentialBackoff(mockFn, { maxAttempts: 3 });

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(1);
      expect(result.data).toBe('éxito');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('debería reintentar en caso de fallo', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Intento 1 falló'))
        .mockRejectedValueOnce(new Error('Intento 2 falló'))
        .mockResolvedValueOnce('éxito en el 3er intento');

      const result = await exponentialBackoff(mockFn, {
        baseDelay: 10, // Muy corto para pruebas
        maxAttempts: 3,
      });

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
      expect(result.data).toBe('éxito en el 3er intento');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('debería fallar después del máximo de intentos', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Siempre falla'));

      const result = await exponentialBackoff(mockFn, {
        baseDelay: 10,
        maxAttempts: 2,
      });

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(3); // Intentos 0, 1, 2
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Siempre falla');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('debería rastrear el tiempo total', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Fallo'))
        .mockResolvedValueOnce('éxito');

      const result = await exponentialBackoff(mockFn, {
        baseDelay: 50,
        maxAttempts: 1,
      });

      expect(result.totalTime).toBeGreaterThanOrEqual(50);
      expect(result.success).toBe(true);
    });
  });

  describe('withBackoff', () => {
    it('debería devolver datos en caso de éxito', async () => {
      const mockFn = jest.fn().mockResolvedValueOnce('datos');

      const result = await withBackoff(mockFn, 3);

      expect(result).toBe('datos');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar error después del máximo de reintentos', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Fallo'));

      await expect(withBackoff(mockFn, 1)).rejects.toThrow('Fallo');
    });
  });

  describe('DEFAULT_BACKOFF_CONFIG', () => {
    it('debería tener valores por defecto sensatos', () => {
      expect(DEFAULT_BACKOFF_CONFIG.baseDelay).toBe(2000);
      expect(DEFAULT_BACKOFF_CONFIG.maxDelay).toBe(64000);
      expect(DEFAULT_BACKOFF_CONFIG.maxAttempts).toBe(4);
      expect(DEFAULT_BACKOFF_CONFIG.multiplier).toBe(2);
    });
  });
});
