/** @jest-environment node */
import { ALERT_EMAIL_KEY, getStoredEmail, setStoredEmail } from "../email";

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
});

describe("ALERT_EMAIL_KEY", () => {
  it("is the expected localStorage key", () => {
    expect(ALERT_EMAIL_KEY).toBe("qdm:alert-email");
  });
});

describe("getStoredEmail", () => {
  it("returns null when key is absent", () => {
    expect(getStoredEmail(mockStorage)).toBeNull();
  });

  it("returns the stored email when present", () => {
    mockStorage[ALERT_EMAIL_KEY] = "user@example.com";
    expect(getStoredEmail(mockStorage)).toBe("user@example.com");
  });
});

describe("setStoredEmail", () => {
  it("writes email to storage under the correct key", () => {
    setStoredEmail(mockStorage, "test@example.com");
    expect(mockStorage[ALERT_EMAIL_KEY]).toBe("test@example.com");
  });

  it("overwrites a previously stored email", () => {
    mockStorage[ALERT_EMAIL_KEY] = "old@example.com";
    setStoredEmail(mockStorage, "new@example.com");
    expect(mockStorage[ALERT_EMAIL_KEY]).toBe("new@example.com");
  });
});
