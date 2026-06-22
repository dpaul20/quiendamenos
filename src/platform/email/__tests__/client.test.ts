/** @jest-environment node */

describe("getResendClient", () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.RESEND_API_KEY;
  });

  it("returns null when RESEND_API_KEY is absent", async () => {
    const { getResendClient } = await import("../client");
    expect(getResendClient()).toBeNull();
  });

  it("returns a Resend instance when RESEND_API_KEY is set", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const { getResendClient } = await import("../client");
    const client = getResendClient();
    expect(client).not.toBeNull();
    expect(typeof client).toBe("object");
  });
});
