import { getProduct } from "../api";
import { ScrapeApiError } from "../errors";

const okResponse = (body: unknown) =>
  ({
    ok: true,
    status: 200,
    json: async () => body,
  }) as unknown as Response;

const errorResponse = (status: number, body: unknown = {}) =>
  ({
    ok: false,
    status,
    json: async () => body,
  }) as unknown as Response;

const mockFetch = jest.fn();

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch as unknown as typeof fetch;
});

describe("getProduct — URL encoding", () => {
  it('encodes the inch symbol so "samsung 65"" reaches the API intact', async () => {
    mockFetch.mockResolvedValue(okResponse([]));

    await getProduct('samsung 65"');

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/scrape?query=samsung%2065%22",
      { method: "GET" },
    );
  });

  it("encodes ampersands so the query is not split into two params", async () => {
    mockFetch.mockResolvedValue(okResponse([]));

    await getProduct("bosch & siemens");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/scrape?query=bosch%20%26%20siemens",
      { method: "GET" },
    );
  });

  it("encodes the hash symbol so the query is not truncated", async () => {
    mockFetch.mockResolvedValue(okResponse([]));

    await getProduct("tv #1");

    expect(mockFetch).toHaveBeenCalledWith("/api/scrape?query=tv%20%231", {
      method: "GET",
    });
  });
});

describe("getProduct — success", () => {
  it("coerces prices to numbers", async () => {
    mockFetch.mockResolvedValue(
      okResponse([{ name: "TV", price: "123.45", brand: "samsung" }]),
    );

    const result = await getProduct("tv");

    expect(result[0].price).toBe(123.45);
  });
});

describe("getProduct — error propagation", () => {
  it("throws ScrapeApiError carrying the HTTP status on 400", async () => {
    mockFetch.mockResolvedValue(
      errorResponse(400, { error: "Query contains disallowed characters" }),
    );

    await expect(getProduct('samsung 65"')).rejects.toBeInstanceOf(
      ScrapeApiError,
    );
  });

  it("reports an invalid search on 400 instead of blaming the connection", async () => {
    mockFetch.mockResolvedValue(
      errorResponse(400, { error: "Query contains disallowed characters" }),
    );

    await expect(getProduct("tv")).rejects.toThrow(
      "La búsqueda no es válida. Revisá los términos e intentá de nuevo.",
    );
  });

  it("reports rate limiting on 429", async () => {
    mockFetch.mockResolvedValue(errorResponse(429));

    await expect(getProduct("tv")).rejects.toThrow(
      "Demasiadas búsquedas seguidas. Esperá un momento e intentá de nuevo.",
    );
  });

  it("reports a service problem on 500", async () => {
    mockFetch.mockResolvedValue(errorResponse(500));

    await expect(getProduct("tv")).rejects.toThrow(
      "El servicio no está disponible en este momento. Intentá de nuevo en unos minutos.",
    );
  });

  it("does not fail when the error body is not valid JSON", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    } as unknown as Response);

    await expect(getProduct("tv")).rejects.toBeInstanceOf(ScrapeApiError);
  });

  it("lets a genuine network failure propagate as a non-ScrapeApiError", async () => {
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(getProduct("tv")).rejects.not.toBeInstanceOf(ScrapeApiError);
  });
});
