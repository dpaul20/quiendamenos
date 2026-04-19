import { redactError } from "../index";

describe("redactError", () => {
  it("returns generic message in production — no internal details", () => {
    const result = redactError(new Error("Redis password: s3cr3t"), "production");
    expect(result).toEqual({ error: "Internal Server Error" });
    expect(JSON.stringify(result)).not.toContain("Redis");
    expect(JSON.stringify(result)).not.toContain("s3cr3t");
  });

  it("returns full message in development", () => {
    const result = redactError(new Error("connection refused"), "development");
    expect(result.error).toBe("connection refused");
  });

  it("handles non-Error throws in production", () => {
    expect(redactError("raw string thrown", "production")).toEqual({ error: "Internal Server Error" });
    expect(redactError(null, "production")).toEqual({ error: "Internal Server Error" });
    expect(redactError(undefined, "production")).toEqual({ error: "Internal Server Error" });
  });

  it("uses development detail when no env arg and NODE_ENV=test (current jest env)", () => {
    // Jest sets NODE_ENV=test; redactError without arg falls through to dev path
    const result = redactError(new Error("some detail"));
    expect(result.error).toBe("some detail");
  });
});
