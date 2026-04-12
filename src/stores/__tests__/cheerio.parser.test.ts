import axios from "axios";
import { createCheerioScraper } from "../parsers/cheerio.parser";
import { StoreConfig } from "../loader";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

const testConfig: StoreConfig = {
  key: "teststore",
  displayName: "Test Store",
  parser: "cheerio",
  url: "https://teststore.com/search?q={query}",
  selectors: {
    container: ".product-item",
    name: ".product-name",
    price: ".product-price",
    image: "img",
    url: "a",
    installment: ".cuotas",
  },
};

const mockHtml = `
  <html><body>
    <div class="product-item">
      <span class="product-name">Smart TV 55"</span>
      <span class="product-price">$299.999</span>
      <img src="https://teststore.com/img/tv.jpg" />
      <a href="/products/tv-55">Ver producto</a>
      <span class="cuotas">12</span>
    </div>
    <div class="product-item">
      <span class="product-name">Notebook Core i5</span>
      <span class="product-price">$450.000</span>
      <img src="https://teststore.com/img/nb.jpg" />
      <a href="/products/notebook">Ver producto</a>
    </div>
  </body></html>
`;

describe("createCheerioScraper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("crea una función scraper", () => {
    const scraper = createCheerioScraper(testConfig);
    expect(typeof scraper).toBe("function");
  });

  it("llama axios con la URL correcta con query sustituida", async () => {
    mockAxios.get.mockResolvedValueOnce({ data: "<html></html>" });
    const scraper = createCheerioScraper(testConfig);
    await scraper("smart tv");
    expect(mockAxios.get).toHaveBeenCalledWith(
      "https://teststore.com/search?q=smart%20tv",
    );
  });

  it("extrae productos correctamente con los selectores del config", async () => {
    mockAxios.get.mockResolvedValueOnce({ data: mockHtml });
    const scraper = createCheerioScraper(testConfig);
    const products = await scraper("tv");

    expect(products).toHaveLength(2);

    expect(products[0].name).toBe('Smart TV 55"');
    expect(products[0].price).toBe(299999);
    expect(products[0].image).toBe("https://teststore.com/img/tv.jpg");
    expect(products[0].url).toBe("https://teststore.com/products/tv-55");
    expect(products[0].installment).toBe(12);
    expect(products[0].brand).toBe("Unknown");
  });

  it("usa displayName como valor de 'from'", async () => {
    mockAxios.get.mockResolvedValueOnce({ data: mockHtml });
    const scraper = createCheerioScraper(testConfig);
    const products = await scraper("tv");
    expect(products[0].from).toBe("Test Store");
  });

  it("instala installment=0 si el selector no está en el config", async () => {
    const configSinCuotas: StoreConfig = {
      ...testConfig,
      selectors: { ...testConfig.selectors, installment: undefined },
    };
    mockAxios.get.mockResolvedValueOnce({ data: mockHtml });
    const scraper = createCheerioScraper(configSinCuotas);
    const products = await scraper("tv");
    expect(products[0].installment).toBe(0);
  });

  it("usa fallback image si img no tiene src ni data-src", async () => {
    const htmlSinImg = `
      <html><body>
        <div class="product-item">
          <span class="product-name">TV</span>
          <span class="product-price">100</span>
          <img />
          <a href="/tv">link</a>
        </div>
      </body></html>
    `;
    mockAxios.get.mockResolvedValueOnce({ data: htmlSinImg });
    const scraper = createCheerioScraper(testConfig);
    const products = await scraper("tv");
    expect(products[0].image).toBe("https://placehold.co/300x200");
  });

  it("retorna [] si axios lanza error", async () => {
    mockAxios.get.mockRejectedValueOnce(new Error("Network error"));
    const scraper = createCheerioScraper(testConfig);
    const products = await scraper("tv");
    expect(products).toEqual([]);
  });

  it("retorna [] si no hay elementos que coincidan con el selector container", async () => {
    mockAxios.get.mockResolvedValueOnce({ data: "<html><body></body></html>" });
    const scraper = createCheerioScraper(testConfig);
    const products = await scraper("tv");
    expect(products).toEqual([]);
  });
});
