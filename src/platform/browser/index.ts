/**
 * Adaptador Playwright
 * 
 * Proporciona capacidades de renderización de JavaScript para web scraping usando Playwright.
 * Gestiona el ciclo de vida del navegador (lanzamiento, cierre, limpieza).
 * Descarga automáticamente los binarios de Chromium en la primera instalación.
 * 
 * Licenciado MIT (vía Playwright)
 */

import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import { exponentialBackoff, RetryResult } from '@/platform/backoff';
import { categorizeError, categorizeHttpError, ErrorType } from '@/platform/errors';

/**
 * Configuración del Adaptador Playwright
 */
export interface PlaywrightAdapterConfig {
  url: string;
  selector?: string;
  timeout?: number;
  maxRetries?: number;
  userAgent?: string;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
}

/**
 * Resultado del raspado con Playwright
 */
export interface PlaywrightResult {
  html: string;
  success: boolean;
  attempts: number;
  duration: number;
  statusCode?: number;
}

/**
 * Gestión singleton del navegador y contexto
 */
let browser: Browser | null = null;
let context: BrowserContext | null = null;
let pageCount = 0;

/**
 * Inicializa la instancia del navegador (patrón singleton)
 * Descarga Chromium en la primera ejecución (automático, ~150MB)
 */
export async function initBrowser(): Promise<void> {
  if (browser) {
    console.log('[Playwright] Navegador ya inicializado');
    return;
  }

  try {
    console.log('[Playwright] Lanzando navegador (Chromium)...');
    browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage', // Reducir uso de memoria
      ],
    });

    console.log('[Playwright] Creando contexto del navegador...');
    context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    console.log('[Playwright] ✅ Navegador inicializado exitosamente');
  } catch (error) {
    console.error('[Playwright] ❌ Error al inicializar el navegador:', error);
    throw error;
  }
}

/**
 * Cierra el navegador y limpia recursos
 */
export async function closeBrowser(): Promise<void> {
  try {
    if (context) {
      console.log('[Playwright] Cerrando contexto del navegador...');
      await context.close();
      context = null;
    }

    if (browser) {
      console.log('[Playwright] Cerrando navegador...');
      await browser.close();
      browser = null;
    }

    pageCount = 0;
    console.log('[Playwright] ✅ Navegador cerrado exitosamente');
  } catch (error) {
    console.error('[Playwright] ❌ Error al cerrar el navegador:', error);
    browser = null;
    context = null;
  }
}

/**
 * Obtiene el estado actual del navegador
 */
export function getBrowserStatus(): {
  isInitialized: boolean;
  pageCount: number;
  memoryUsage?: NodeJS.MemoryUsage;
} {
  return {
    isInitialized: !!browser && !!context,
    pageCount,
    memoryUsage: process.memoryUsage(),
  };
}

/**
 * Raspa una URL usando Playwright con reintentos automáticos
 * 
 * @param config Objeto de configuración con URL, selector, timeout, etc.
 * @returns PlaywrightResult con contenido HTML y metadatos
 */
export async function playwriteScrape(config: PlaywrightAdapterConfig): Promise<PlaywrightResult> {
  const startTime = Date.now();
  const {
    url,
    selector,
    timeout = 5000,
    maxRetries = 3,
    waitUntil = 'networkidle',
  } = config;

  // Asegurar que el navegador está inicializado
  if (!browser || !context) {
    await initBrowser();
  }

  if (!browser || !context) {
    throw new Error('[Playwright] Fallo al inicializar el contexto del navegador');
  }

  try {
    // Usar exponential backoff para reintentos automáticos en caso de fallo
    const result = await exponentialBackoff(
      async () => {
        let page: Page | null = null;

        try {
          pageCount++;
          page = await context!.newPage();

          // Registrar creación de página
          console.log(`[Playwright] 📄 Página ${pageCount} creada para: ${url}`);

          // Navegar a URL con timeout y condición de espera
          const response = await page.goto(url, {
            waitUntil: waitUntil as 'load' | 'domcontentloaded' | 'networkidle',
            timeout,
          });

          const statusCode = response?.status();
          console.log(
            `[Playwright] 📥 Estado recibido: ${statusCode} desde ${url}`
          );

          // Esperar selector si se proporciona
          if (selector) {
            try {
              await page.waitForSelector(selector, { timeout });
              console.log(`[Playwright] ✅ Selector encontrado: ${selector}`);
            } catch {
              console.warn(
                `[Playwright] ⚠️ Selector no encontrado (podría necesitar ejecución JS): ${selector}`
              );
            }
          }

          // Obtener contenido de la página
          const html = await page.content();

          // Verificar que el contenido es válido (no vacío/página de error)
          if (!html || html.length < 100) {
            throw new Error('Contenido muy pequeño - posible que se requiera JavaScript');
          }

          return {
            html,
            statusCode,
          };
        } finally {
          if (page) {
            pageCount--;
            await page.close();
            console.log(`[Playwright] 🗑️  Página cerrada`);
          }
        }
      },
      { maxAttempts: maxRetries }
    );

    if (!result.success) {
      const error = categorizeError(result.error);
      const duration = Date.now() - startTime;

      console.error(`[Playwright] ❌ Fallo después de ${result.attempts} intentos:`, {
        url,
        errorType: error.type,
        errorMessage: error.message,
        duration,
      });

      return {
        html: '',
        success: false,
        attempts: result.attempts,
        duration,
      };
    }

    const duration = Date.now() - startTime;
    console.log(`[Playwright] ✅ Éxito en ${result.attempts} intento(s) - ${duration}ms`);

    return {
      html: result.data!.html,
      success: true,
      attempts: result.attempts,
      duration,
      statusCode: result.data!.statusCode,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const categorized = categorizeError(error);

    console.error(`[Playwright] 💥 Error no manejado:`, {
      url,
      errorType: categorized.type,
      errorMessage: categorized.message,
      duration,
    });

    return {
      html: '',
      success: false,
      attempts: 1,
      duration,
    };
  }
}

/**
 * Verificación de salud del navegador
 * Devuelve estado y métricas
 */
export async function checkBrowserHealth(): Promise<{
  healthy: boolean;
  memoryMB: number;
  pageCount: number;
  message: string;
}> {
  const memUsage = process.memoryUsage();
  const memoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const status = getBrowserStatus();

  const healthy = status.isInitialized && memoryMB < 500;
  const message = healthy
    ? `✅ Navegador saludable (${memoryMB}MB, ${pageCount} páginas)`
    : `⚠️ Advertencia del navegador (${memoryMB}MB, ${pageCount} páginas)`;

  return {
    healthy,
    memoryMB,
    pageCount: status.pageCount,
    message,
  };
}
