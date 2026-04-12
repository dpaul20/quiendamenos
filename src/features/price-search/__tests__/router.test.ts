import { scrapeWithFallback } from '../router';
import { exponentialBackoff } from '@/platform/backoff';
import { getCachedData } from '@/platform/cache';
import { Product } from '@/types/product';

jest.mock('@/platform/backoff');
jest.mock('@/platform/cache', () => ({
  ...jest.requireActual('@/platform/cache'),
  getCachedData: jest.fn(),
  setCachedData: jest.fn(),
  setStoreCacheNX: jest.fn(),
}));

const mockExponentialBackoff = exponentialBackoff as jest.MockedFunction<typeof exponentialBackoff>;
const mockGetCachedData = getCachedData as jest.MockedFunction<typeof getCachedData>;

const sampleProduct: Product = {
  name: 'TV Samsung 55"',
  price: 100000,
  url: 'https://tienda.com/tv',
  image: 'https://tienda.com/tv.jpg',
  brand: 'Samsung',
  installment: 12,
  from: 'naldo' as Product['from'],
};

const cachedProduct: Product = {
  name: 'TV LG 55" (caché)',
  price: 95000,
  url: 'https://tienda.com/tv-lg',
  image: 'https://tienda.com/tv-lg.jpg',
  brand: 'LG',
  installment: 6,
  from: 'naldo' as Product['from'],
};

describe('scrapeWithFallback', () => {
  const mockScraper = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve productos si primaryScraper tiene éxito en primer intento', async () => {
    mockExponentialBackoff.mockResolvedValueOnce({
      success: true,
      data: [sampleProduct],
      attempts: 1,
      totalTime: 10,
    });

    const result = await scrapeWithFallback('naldo', 'tv', mockScraper);

    expect(result).toEqual([sampleProduct]);
  });

  it('reintenta y tiene éxito en el segundo intento', async () => {
    mockExponentialBackoff.mockResolvedValueOnce({
      success: true,
      data: [sampleProduct],
      attempts: 2,
      totalTime: 2500,
    });

    const result = await scrapeWithFallback('naldo', 'tv', mockScraper);

    expect(result).toEqual([sampleProduct]);
  });

  it('devuelve caché cuando todos los intentos fallan (cache hit)', async () => {
    mockExponentialBackoff.mockResolvedValueOnce({
      success: false,
      error: new Error('conexión rechazada'),
      attempts: 4,
      totalTime: 8000,
    });
    mockGetCachedData.mockResolvedValueOnce([cachedProduct]);

    const result = await scrapeWithFallback('naldo', 'tv', mockScraper);

    expect(result).toEqual([cachedProduct]);
    expect(mockGetCachedData).toHaveBeenCalledWith('s:naldo:tv');
  });

  it('devuelve [] cuando todos los intentos fallan y caché es null (cache miss)', async () => {
    mockExponentialBackoff.mockResolvedValueOnce({
      success: false,
      error: new Error('timeout'),
      attempts: 4,
      totalTime: 8000,
    });
    mockGetCachedData.mockResolvedValueOnce(null);

    const result = await scrapeWithFallback('naldo', 'tv', mockScraper);

    expect(result).toEqual([]);
  });

  it('NO llama setCachedData (las escrituras se delegan al pipeline de service.ts)', async () => {
    const { setCachedData } = jest.requireMock('@/platform/cache') as { setCachedData: jest.Mock };

    mockExponentialBackoff.mockResolvedValueOnce({
      success: true,
      data: [sampleProduct],
      attempts: 1,
      totalTime: 10,
    });

    await scrapeWithFallback('naldo', 'tv', mockScraper);

    expect(setCachedData).not.toHaveBeenCalled();
  });

  it('NO llama setCachedData si se devuelve resultado de caché', async () => {
    const { setCachedData } = jest.requireMock('@/platform/cache') as { setCachedData: jest.Mock };

    mockExponentialBackoff.mockResolvedValueOnce({
      success: false,
      error: new Error('fallo'),
      attempts: 4,
      totalTime: 8000,
    });
    mockGetCachedData.mockResolvedValueOnce([cachedProduct]);

    await scrapeWithFallback('naldo', 'tv', mockScraper);

    expect(setCachedData).not.toHaveBeenCalled();
  });
});
