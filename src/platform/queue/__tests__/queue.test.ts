import { scheduleRevalidation } from "@/platform/queue";

describe("scheduleRevalidation", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("calls the provided callback exactly once via setImmediate", async () => {
    const callback = jest.fn().mockResolvedValue(undefined);

    scheduleRevalidation(callback);

    // callback has NOT been called yet (setImmediate deferred)
    expect(callback).not.toHaveBeenCalled();

    // Let setImmediate flush
    await new Promise<void>((resolve) => setImmediate(resolve));
    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("catches errors thrown by the callback — no unhandled rejection", async () => {
    const error = new Error("revalidation failed");
    const callback = jest.fn().mockRejectedValue(error);

    // Must not throw synchronously
    expect(() => scheduleRevalidation(callback)).not.toThrow();

    // Let setImmediate flush
    await new Promise<void>((resolve) => setImmediate(resolve));
    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalled();
  });

  it("calls callback exactly once per invocation", async () => {
    const callback = jest.fn().mockResolvedValue(undefined);

    scheduleRevalidation(callback);
    scheduleRevalidation(callback);

    await new Promise<void>((resolve) => setImmediate(resolve));
    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(callback).toHaveBeenCalledTimes(2);
  });
});
