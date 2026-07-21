import { redactSecrets, toLogSafeError } from "../log-safe";

const REDACTED = "***REDACTED***";

describe("redactSecrets — sensitive URL parameters", () => {
  it("masks api_key, the exact leak seen in the Fravega logs", () => {
    const url =
      "https://api.scraperapi.com?api_key=10c72dd259391bcada437333574ed519&url=https%3A%2F%2Fwww.fravega.com";

    const result = redactSecrets(url);

    expect(result).not.toContain("10c72dd259391bcada437333574ed519");
    expect(result).toContain(`api_key=${REDACTED}`);
  });

  it("keeps non-sensitive parameters readable so logs stay useful", () => {
    const url =
      "https://api.scraperapi.com?api_key=abcdef123456&url=https%3A%2F%2Fwww.fravega.com&limit=50";

    const result = redactSecrets(url);

    expect(result).toContain("limit=50");
    expect(result).toContain("url=https%3A%2F%2Fwww.fravega.com");
    expect(result).not.toContain("abcdef123456");
  });

  it("masks the usual secret parameter names", () => {
    const names = [
      "apikey",
      "access_token",
      "token",
      "secret",
      "client_secret",
      "password",
      "authorization",
      "signature",
    ];

    for (const name of names) {
      const result = redactSecrets(`https://x.com/a?${name}=supersecretvalue`);
      expect(result).not.toContain("supersecretvalue");
    }
  });

  it("matches parameter names case-insensitively", () => {
    const result = redactSecrets("https://x.com/a?API_KEY=supersecretvalue");
    expect(result).not.toContain("supersecretvalue");
  });

  it("masks every occurrence, not just the first", () => {
    const result = redactSecrets(
      "https://x.com/a?api_key=aaaaaaaa1 https://y.com/b?api_key=bbbbbbbb2",
    );
    expect(result).not.toContain("aaaaaaaa1");
    expect(result).not.toContain("bbbbbbbb2");
  });
});

describe("redactSecrets — environment secret values", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it("masks a secret env value even when it appears outside a query string", () => {
    process.env = { ...originalEnv, SCRAPER_API_KEY: "envsecret1234567" };

    const result = redactSecrets(
      "request failed for token envsecret1234567 in path segment",
    );

    expect(result).not.toContain("envsecret1234567");
    expect(result).toContain(REDACTED);
  });

  it("masks values of any env var whose name looks secret", () => {
    process.env = {
      ...originalEnv,
      API_SECRET_KEY: "apisecretvalue123",
      REDIS_PASSWORD: "redispassword123",
      RESEND_API_KEY: "resendkeyvalue123",
    };

    const result = redactSecrets(
      "apisecretvalue123 / redispassword123 / resendkeyvalue123",
    );

    expect(result).not.toContain("apisecretvalue123");
    expect(result).not.toContain("redispassword123");
    expect(result).not.toContain("resendkeyvalue123");
  });

  it("ignores short env values to avoid masking half the log", () => {
    process.env = { ...originalEnv, SOME_KEY: "dev" };

    const result = redactSecrets("running in dev mode");

    expect(result).toBe("running in dev mode");
  });

  it("leaves non-secret env values alone", () => {
    process.env = { ...originalEnv, PUBLIC_BASE_URL: "https://example.com" };

    const result = redactSecrets("calling https://example.com");

    expect(result).toContain("https://example.com");
  });
});

describe("toLogSafeError — axios-shaped errors", () => {
  const axiosError = () => {
    const error = new Error("timeout of 23000ms exceeded") as Error & {
      code: string;
      config: { url: string; method: string; headers: Record<string, string> };
      request: Record<string, unknown>;
    };
    error.name = "AxiosError";
    error.code = "ECONNABORTED";
    error.config = {
      url: "https://api.scraperapi.com?api_key=10c72dd259391bcada437333574ed519&url=https%3A%2F%2Fwww.fravega.com",
      method: "get",
      headers: { Referer: "https://www.fravega.com/" },
    };
    error.request = { _header: "GET / HTTP/1.1", socket: { authorized: true } };
    return error;
  };

  it("never leaks the api key present in config.url", () => {
    const result = toLogSafeError(axiosError());
    expect(result).not.toContain("10c72dd259391bcada437333574ed519");
  });

  it("keeps the diagnostic signal — name, message, code and method", () => {
    const result = toLogSafeError(axiosError());

    expect(result).toContain("AxiosError");
    expect(result).toContain("timeout of 23000ms exceeded");
    expect(result).toContain("ECONNABORTED");
    expect(result).toContain("GET");
    expect(result).toContain("api.scraperapi.com");
  });

  it("includes the HTTP status when the upstream answered", () => {
    const error = new Error("Request failed with status code 403") as Error & {
      response: { status: number };
    };
    error.response = { status: 403 };

    expect(toLogSafeError(error)).toContain("403");
  });

  it("does not dump the raw request/socket internals", () => {
    const result = toLogSafeError(axiosError());

    expect(result).not.toContain("_header");
    expect(result).not.toContain("authorized");
    expect(result).not.toContain("Referer");
  });

  it("stays on a single line", () => {
    expect(toLogSafeError(axiosError())).not.toContain("\n");
  });
});

describe("toLogSafeError — other shapes", () => {
  it("formats a plain Error", () => {
    const result = toLogSafeError(new Error("boom"));
    expect(result).toBe("Error: boom");
  });

  it("redacts secrets embedded in a plain Error message", () => {
    const result = toLogSafeError(
      new Error("failed calling https://x.com/a?api_key=abcdef123456"),
    );
    expect(result).not.toContain("abcdef123456");
  });

  it("handles strings, null and undefined without throwing", () => {
    expect(toLogSafeError("raw string")).toContain("raw string");
    expect(() => toLogSafeError(null)).not.toThrow();
    expect(() => toLogSafeError(undefined)).not.toThrow();
  });

  it("truncates an oversized message instead of flooding the log", () => {
    const result = toLogSafeError(new Error("x".repeat(5000)));
    expect(result.length).toBeLessThan(1000);
  });
});
