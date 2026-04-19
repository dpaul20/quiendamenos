import { exponentialBackoff } from '@/platform/backoff';

describe('Estrategia de Backoff', () => {
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
        baseDelay: 10,
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
      expect(result.attempts).toBe(3);
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
});
