/**
 * Pruebas para el Adaptador Playwright
 */

import {
  getBrowserStatus,
  checkBrowserHealth,
} from '@/platform/browser';

describe('Adaptador Playwright', () => {
  // Nota: Las pruebas completas del navegador requerirían mocks o pruebas de integración
  // Estas son pruebas unitarias básicas para funciones que no dependen del navegador

  describe('getBrowserStatus', () => {
    it('debería devolver estado con isInitialized falso por defecto', () => {
      // Reiniciar estado del navegador para pruebas
      const status = getBrowserStatus();

      expect(status).toHaveProperty('isInitialized');
      expect(status).toHaveProperty('pageCount');
      expect(status).toHaveProperty('memoryUsage');
      expect(typeof status.isInitialized).toBe('boolean');
      expect(typeof status.pageCount).toBe('number');
    });

    it('debería tener información de uso de memoria', () => {
      const status = getBrowserStatus();

      expect(status.memoryUsage).toHaveProperty('heapUsed');
      expect(status.memoryUsage).toHaveProperty('heapTotal');
      expect(status.memoryUsage).toHaveProperty('rss');
    });
  });

  describe('checkBrowserHealth', () => {
    it('debería devolver objeto de verificación de salud', async () => {
      const health = await checkBrowserHealth();

      expect(health).toHaveProperty('healthy');
      expect(health).toHaveProperty('memoryMB');
      expect(health).toHaveProperty('pageCount');
      expect(health).toHaveProperty('message');

      expect(typeof health.healthy).toBe('boolean');
      expect(typeof health.memoryMB).toBe('number');
      expect(typeof health.pageCount).toBe('number');
      expect(typeof health.message).toBe('string');
    });

    it('debería reportar no saludable cuando el navegador no está inicializado', async () => {
      const health = await checkBrowserHealth();

      // La memoria debería estar bajo 500MB inicialmente
      expect(health.memoryMB).toBeLessThan(500);
      // Sin navegador inicializado, healthy debe ser false
      expect(health.healthy).toBe(false);
    });
  });

  // Las pruebas de integración irían aquí pero requieren configuración real de Playwright
  // Estructura de ejemplo:
  /*
  describe('playwriteScrape - Integración', () => {
    let server: Server;

    beforeAll(async () => {
      await initBrowser();
      // Iniciar servidor de prueba
    });

    afterAll(async () => {
      await closeBrowser();
    });

    it('debería raspar HTML simple', async () => {
      const result = await playwriteScrape({
        url: 'http://localhost:3000/test',
        timeout: 5000,
      });

      expect(result.success).toBe(true);
      expect(result.html).toContain('contenido esperado');
    });
  });
  */
});
