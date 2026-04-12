import { loadStores } from "../loader";
import { _clearForTests, getAllStores, initRegistry } from "../registry";

jest.mock("fs");
import { existsSync, readFileSync } from "fs";

const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;

const validConfig = JSON.stringify({
  stores: [
    {
      key: "teststore",
      displayName: "Test Store",
      parser: "cheerio",
      url: "https://teststore.com/search?q={query}",
      selectors: {
        container: ".product",
        name: ".name",
        price: ".price",
        image: "img",
        url: "a",
      },
    },
  ],
});

describe("loadStores", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna [] si el archivo no existe", () => {
    mockExistsSync.mockReturnValue(false);
    expect(loadStores()).toEqual([]);
  });

  it("parsea config válido y retorna array de StoreConfig", () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(validConfig as unknown as Buffer);

    const result = loadStores();
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe("teststore");
    expect(result[0].displayName).toBe("Test Store");
    expect(result[0].selectors.container).toBe(".product");
  });

  it("retorna [] si config tiene stores vacío", () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(
      JSON.stringify({ stores: [] }) as unknown as Buffer,
    );

    expect(loadStores()).toEqual([]);
  });

  it("lanza Error si el JSON es inválido", () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue("{ invalid json" as unknown as Buffer);

    expect(() => loadStores()).toThrow("[loader] stores.config.json has invalid JSON");
  });

  it("lanza Error con mensaje descriptivo si falta campo requerido 'key'", () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(
      JSON.stringify({
        stores: [
          {
            displayName: "Test",
            parser: "cheerio",
            url: "https://test.com?q={query}",
            selectors: { container: ".p", name: ".n", price: ".pr" },
          },
        ],
      }) as unknown as Buffer,
    );

    expect(() => loadStores()).toThrow('[loader] stores[0] missing required field: "key"');
  });

  it("lanza Error con mensaje descriptivo si falta campo requerido 'displayName'", () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(
      JSON.stringify({
        stores: [
          {
            key: "test",
            parser: "cheerio",
            url: "https://test.com?q={query}",
            selectors: { container: ".p", name: ".n", price: ".pr" },
          },
        ],
      }) as unknown as Buffer,
    );

    expect(() => loadStores()).toThrow('[loader] stores[0] missing required field: "displayName"');
  });

  it("lanza Error si falta selector requerido 'container'", () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(
      JSON.stringify({
        stores: [
          {
            key: "test",
            displayName: "Test",
            parser: "cheerio",
            url: "https://test.com?q={query}",
            selectors: { name: ".n", price: ".pr" },
          },
        ],
      }) as unknown as Buffer,
    );

    expect(() => loadStores()).toThrow('[loader] stores[0].selectors missing required field: "container"');
  });

  it("lanza Error si selectors está ausente", () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(
      JSON.stringify({
        stores: [
          {
            key: "test",
            displayName: "Test",
            parser: "cheerio",
            url: "https://test.com?q={query}",
          },
        ],
      }) as unknown as Buffer,
    );

    expect(() => loadStores()).toThrow('[loader] stores[0] missing "selectors"');
  });
});

describe("registry", () => {
  beforeEach(() => {
    _clearForTests();
    jest.clearAllMocks();
  });

  it("retorna [] si config está vacío", () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(
      JSON.stringify({ stores: [] }) as unknown as Buffer,
    );
    initRegistry();
    expect(getAllStores()).toEqual([]);
  });

  it("retorna [] si el archivo no existe", () => {
    mockExistsSync.mockReturnValue(false);
    initRegistry();
    expect(getAllStores()).toEqual([]);
  });

  it("registra scraper por cada entrada válida del config", () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(validConfig as unknown as Buffer);
    initRegistry();
    const stores = getAllStores();
    expect(stores).toHaveLength(1);
    expect(stores[0].key).toBe("teststore");
    expect(typeof stores[0].scraper).toBe("function");
  });
});
