/**
 * Pruebas para el Categorizador de Errores
 */

import {
  categorizeError,
  categorizeHttpError,
  ErrorType,
  isRetriable,
  getRetryDelay,
} from '@/lib/strategies/error-categorizer';

describe('Categorizador de Errores', () => {
  describe('categorizeHttpError', () => {
    it('debería categorizar 429 como RATE_LIMITED', () => {
      const error = categorizeHttpError(429);

      expect(error.type).toBe(ErrorType.RATE_LIMITED);
      expect(error.retriable).toBe(true);
      expect(error.statusCode).toBe(429);
    });

    it('debería categorizar 403 como BLOCKING', () => {
      const error = categorizeHttpError(403);

      expect(error.type).toBe(ErrorType.BLOCKING);
      expect(error.retriable).toBe(true);
      expect(error.statusCode).toBe(403);
    });

    it('debería categorizar 404 como NOT_FOUND', () => {
      const error = categorizeHttpError(404);

      expect(error.type).toBe(ErrorType.NOT_FOUND);
      expect(error.retriable).toBe(false);
      expect(error.statusCode).toBe(404);
    });

    it('debería categorizar errores 5xx como SERVER_ERROR', () => {
      [500, 502, 503, 504].forEach((code) => {
        const error = categorizeHttpError(code);
        expect(error.type).toBe(ErrorType.SERVER_ERROR);
        expect(error.retriable).toBe(true);
        expect(error.statusCode).toBe(code);
      });
    });

    it('debería respetar el header Retry-After', () => {
      const error = categorizeHttpError(429, '60');

      expect(error.retryDelay).toBe(60);
    });

    it('debería categorizar códigos desconocidos como UNKNOWN', () => {
      const error = categorizeHttpError(418); // Soy una tetera

      expect(error.type).toBe(ErrorType.UNKNOWN);
      expect(error.retriable).toBe(false);
    });
  });

  describe('categorizeError', () => {
    it('debería detectar ECONNREFUSED', () => {
      const error = new Error('ECONNREFUSED');
      const categorized = categorizeError(error);

      expect(categorized.type).toBe(ErrorType.NETWORK_ERROR);
      expect(categorized.retriable).toBe(true);
    });

    it('debería detectar errores de timeout', () => {
      const error = new Error('Request timeout');
      const categorized = categorizeError(error);

      expect(categorized.type).toBe(ErrorType.TIMEOUT);
      expect(categorized.retriable).toBe(true);
    });

    it('debería detectar ENOTFOUND (DNS)', () => {
      const error = new Error('getaddrinfo ENOTFOUND example.com');
      const categorized = categorizeError(error);

      expect(categorized.type).toBe(ErrorType.NETWORK_ERROR);
      expect(categorized.retriable).toBe(true);
    });

    it('debería detectar ECONNRESET', () => {
      const error = new Error('ECONNRESET');
      const categorized = categorizeError(error);

      expect(categorized.type).toBe(ErrorType.NETWORK_ERROR);
      expect(categorized.retriable).toBe(true);
    });

    it('debería detectar que se requiere JavaScript', () => {
      const error = new Error('Content requires JavaScript rendering');
      const categorized = categorizeError(error);

      expect(categorized.type).toBe(ErrorType.JAVASCRIPT_REQUIRED);
      expect(categorized.retriable).toBe(true);
    });

    it('debería detectar contenido HTML pequeño como que requiere JavaScript', () => {
      const smallHtml = '<html></html>';
      const error = new Error('Some error');
      const categorized = categorizeError(error, smallHtml);

      // Podrá ser marcado como retriable aunque el error original es desconocido
      expect(categorized.type).toBe(ErrorType.UNKNOWN);
      expect(categorized.retriable).toBe(true);
    });

    it('debería manejar null/undefined', () => {
      const categorized = categorizeError(null);

      expect(categorized.type).toBe(ErrorType.UNKNOWN);
      expect(categorized.retriable).toBe(false);
    });

    it('debería manejar errores de string', () => {
      const categorized1 = categorizeError('timeout occurred');
      expect(categorized1.type).toBe(ErrorType.TIMEOUT);
      expect(categorized1.retriable).toBe(true);

      const categorized2 = categorizeError('network connection failed');
      expect(categorized2.type).toBe(ErrorType.NETWORK_ERROR);
      expect(categorized2.retriable).toBe(true);
    });

    it('debería marcar errores desconocidos como retriable por defecto', () => {
      const error = new Error('Some weird error');
      const categorized = categorizeError(error);

      expect(categorized.retriable).toBe(true);
    });
  });

  describe('isRetriable', () => {
    it('debería devolver true para tipos de error recuperables', () => {
      const retriableTypes = [
        ErrorType.RATE_LIMITED,
        ErrorType.BLOCKING,
        ErrorType.NETWORK_ERROR,
        ErrorType.SERVER_ERROR,
        ErrorType.TIMEOUT,
        ErrorType.JAVASCRIPT_REQUIRED,
      ];

      retriableTypes.forEach((type) => {
        expect(isRetriable(type)).toBe(true);
      });
    });

    it('debería devolver false para tipos de error no recuperables', () => {
      const nonRetriableTypes = [ErrorType.NOT_FOUND, ErrorType.UNKNOWN];

      nonRetriableTypes.forEach((type) => {
        expect(isRetriable(type)).toBe(false);
      });
    });
  });

  describe('getRetryDelay', () => {
    it('debería usar el delay proporcionado por el servidor si está disponible', () => {
      const error = {
        type: ErrorType.RATE_LIMITED,
        message: 'Rate limited',
        retriable: true,
        retryDelay: 30, // 30 segundos del header Retry-After
      };

      const delay = getRetryDelay(error);
      expect(delay).toBe(30000); // Convertir a milisegundos
    });

    it('debería usar delay por defecto según el tipo de error', () => {
      const testCases = [
        [ErrorType.RATE_LIMITED, 5000],
        [ErrorType.BLOCKING, 10000],
        [ErrorType.SERVER_ERROR, 15000],
        [ErrorType.TIMEOUT, 3000],
        [ErrorType.NETWORK_ERROR, 2000],
      ];

      testCases.forEach(([type, expectedDelay]) => {
        const error = {
          type: type as ErrorType,
          message: 'Test error',
          retriable: true,
        };

        const delay = getRetryDelay(error);
        expect(delay).toBe(expectedDelay);
      });
    });

    it('debería devolver undefined para tipos desconocidos sin delay del servidor', () => {
      const error = {
        type: ErrorType.UNKNOWN,
        message: 'Unknown',
        retriable: false,
      };

      const delay = getRetryDelay(error);
      expect(delay).toBeUndefined();
    });
  });
});
