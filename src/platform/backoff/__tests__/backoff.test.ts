import { exponentialBackoff } from "@/platform/backoff";

describe("Estrategia de Backoff", () => {
  describe("exponentialBackoff", () => {
    it("debería tener éxito en el primer intento", async () => {
      const mockFn = jest.fn().mockResolvedValueOnce("éxito");

      const result = await exponentialBackoff(mockFn, { maxAttempts: 3 });

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(1);
      expect(result.data).toBe("éxito");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("debería reintentar en caso de fallo", async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("Intento 1 falló"))
        .mockRejectedValueOnce(new Error("Intento 2 falló"))
        .mockResolvedValueOnce("éxito en el 3er intento");

      const result = await exponentialBackoff(mockFn, {
        baseDelay: 10,
        maxAttempts: 3,
      });

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
      expect(result.data).toBe("éxito en el 3er intento");
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it("debería fallar después del máximo de intentos", async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error("Siempre falla"));

      const result = await exponentialBackoff(mockFn, {
        baseDelay: 10,
        maxAttempts: 2,
      });

      expect(result.success).toBe(false);
      expect(result.attempts).toBe(3);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("Siempre falla");
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it("deja de reintentar cuando el próximo delay excedería el presupuesto", async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error("Siempre falla"));

      const result = await exponentialBackoff(mockFn, {
        baseDelay: 100,
        maxAttempts: 4,
        maxTotalTime: 150,
        jitter: 0,
      });

      // Intento 1 falla, el delay de 100ms entra en presupuesto → intento 2.
      // Tras el intento 2 el siguiente delay (200ms) excede los 150ms → corta.
      expect(result.success).toBe(false);
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(result.attempts).toBe(2);
      expect(result.error?.message).toBe("Siempre falla");
    });

    it("no reintenta cuando el primer intento ya consumió el presupuesto", async () => {
      const mockFn = jest.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 60));
        throw new Error("Timeout largo");
      });

      const result = await exponentialBackoff(mockFn, {
        baseDelay: 10,
        maxAttempts: 4,
        maxTotalTime: 50,
        jitter: 0,
      });

      expect(result.success).toBe(false);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result.attempts).toBe(1);
    });

    it("el presupuesto no afecta a las llamadas que tienen éxito", async () => {
      const mockFn = jest.fn().mockResolvedValue("éxito");

      const result = await exponentialBackoff(mockFn, { maxTotalTime: 1 });

      expect(result.success).toBe(true);
      expect(result.data).toBe("éxito");
    });

    it("aplica un presupuesto por defecto sin configuración explícita", async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error("Siempre falla"));

      const result = await exponentialBackoff(mockFn, {
        baseDelay: 10,
        maxAttempts: 2,
      });

      expect(result.success).toBe(false);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it("debería rastrear el tiempo total", async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("Fallo"))
        .mockResolvedValueOnce("éxito");

      const result = await exponentialBackoff(mockFn, {
        baseDelay: 50,
        maxAttempts: 1,
      });

      expect(result.totalTime).toBeGreaterThanOrEqual(50);
      expect(result.success).toBe(true);
    });
  });
});
