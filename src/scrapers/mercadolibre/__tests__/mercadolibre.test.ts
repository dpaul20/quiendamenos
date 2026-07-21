import { scrapeMercadoLibre } from "@/scrapers/mercadolibre";

jest.mock("@/platform/http", () => ({
  httpClient: { get: jest.fn() },
}));

jest.mock("@/platform/meli/token", () => ({
  getMeliAccessToken: jest.fn(),
  invalidateMeliToken: jest.fn(),
}));

import { httpClient } from "@/platform/http";
import { getMeliAccessToken, invalidateMeliToken } from "@/platform/meli/token";

const mockGet = httpClient.get as jest.Mock;
const mockGetToken = getMeliAccessToken as jest.Mock;
const mockInvalidate = invalidateMeliToken as jest.Mock;

const httpError = (status: number) => {
  const error = new Error(
    `Request failed with status code ${status}`,
  ) as Error & {
    response: { status: number };
  };
  error.response = { status };
  return error;
};

const searchResponse = () => ({
  data: {
    results: [
      {
        title: "Smart TV Samsung 65",
        price: 900000,
        thumbnail: "https://http2.mlstatic.com/tv-I.jpg",
        permalink: "https://articulo.mercadolibre.com.ar/MLA-123",
        attributes: [{ id: "BRAND", value_name: "Samsung" }],
      },
    ],
  },
});

let errorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetToken.mockResolvedValue("APP_USR-token-abc");
  errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
});

describe("scrapeMercadoLibre — authentication", () => {
  it("sends the access token as a Bearer header", async () => {
    mockGet.mockResolvedValue(searchResponse());

    await scrapeMercadoLibre("samsung 65");

    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("/sites/MLA/search"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer APP_USR-token-abc",
        }),
      }),
    );
  });

  it("encodes the query in the search URL", async () => {
    mockGet.mockResolvedValue(searchResponse());

    await scrapeMercadoLibre('samsung 65"');

    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("q=samsung%2065%22");
  });

  it("maps the response to products", async () => {
    mockGet.mockResolvedValue(searchResponse());

    const result = await scrapeMercadoLibre("samsung 65");

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Smart TV Samsung 65");
    expect(result[0].brand).toBe("Samsung");
  });
});

describe("scrapeMercadoLibre — expired token recovery", () => {
  it("invalidates the token and retries once on 401", async () => {
    mockGet
      .mockRejectedValueOnce(httpError(401))
      .mockResolvedValueOnce(searchResponse());
    mockGetToken
      .mockResolvedValueOnce("APP_USR-stale")
      .mockResolvedValueOnce("APP_USR-fresh");

    const result = await scrapeMercadoLibre("samsung 65");

    expect(mockInvalidate).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(mockGet.mock.calls[1][1].headers.Authorization).toBe(
      "Bearer APP_USR-fresh",
    );
    expect(result).toHaveLength(1);
  });

  it("also retries on 403, the status the API returns without a token", async () => {
    mockGet
      .mockRejectedValueOnce(httpError(403))
      .mockResolvedValueOnce(searchResponse());

    await scrapeMercadoLibre("samsung 65");

    expect(mockInvalidate).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it("retries only once — a second auth failure propagates", async () => {
    mockGet.mockRejectedValue(httpError(401));

    await expect(scrapeMercadoLibre("samsung 65")).rejects.toThrow();

    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it("does not retry on errors unrelated to authentication", async () => {
    mockGet.mockRejectedValue(httpError(500));

    await expect(scrapeMercadoLibre("samsung 65")).rejects.toThrow();

    expect(mockInvalidate).not.toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalledTimes(1);
  });
});
