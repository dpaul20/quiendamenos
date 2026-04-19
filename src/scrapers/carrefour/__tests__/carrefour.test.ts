import { scrapeCarrefour } from '@/scrapers/carrefour';

jest.mock('@/platform/http', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

import { httpClient } from '@/platform/http';

const mockGet = httpClient.get as jest.Mock;

describe('scrapeCarrefour', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('follows relative redirect to carrefour.com.ar', async () => {
    mockGet
      .mockResolvedValueOnce({ data: { redirect: '/electronica' } })
      .mockResolvedValueOnce({ data: '<html></html>' });

    await scrapeCarrefour('tv');

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(mockGet).toHaveBeenNthCalledWith(
      2,
      'https://www.carrefour.com.ar/electronica',
      expect.any(Object),
    );
  });

  it('returns [] and makes no second request when redirect is an external URL', async () => {
    mockGet.mockResolvedValueOnce({ data: { redirect: 'https://evil.com/steal' } });

    const result = await scrapeCarrefour('tv');

    expect(result).toEqual([]);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('returns [] and makes no second request when redirect is javascript:void(0)', async () => {
    mockGet.mockResolvedValueOnce({ data: { redirect: 'javascript:void(0)' } });

    const result = await scrapeCarrefour('tv');

    expect(result).toEqual([]);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('returns mapped products when data.products is present (no redirect)', async () => {
    const mockProduct = {
      productName: 'TV Samsung 55',
      brand: 'samsung',
      link: '/tv-samsung',
      priceRange: { sellingPrice: { lowPrice: 100000 } },
      items: [
        {
          images: [{ imageUrl: 'https://img.carrefour.com.ar/tv.jpg' }],
          sellers: [
            {
              sellerDefault: true,
              commertialOffer: { Installments: [] },
            },
          ],
        },
      ],
      categories: [],
    };

    mockGet.mockResolvedValueOnce({ data: { products: [mockProduct] } });

    const result = await scrapeCarrefour('tv');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('TV Samsung 55');
    expect(mockGet).toHaveBeenCalledTimes(1);
  });
});
