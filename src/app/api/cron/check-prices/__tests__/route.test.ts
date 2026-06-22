/** @jest-environment node */

// Set env vars before module imports
process.env.CRON_SECRET = "test-secret";
process.env.ALERT_TOKEN_SECRET = "test-token-secret";
process.env.BASE_URL = "https://quiendamenos.com";

jest.mock("@/platform/supabase", () => ({
  getSupabaseClient: jest.fn(),
}));

jest.mock("@/features/price-search/service", () => ({
  scrapeWebsite: jest.fn(),
}));

jest.mock("@/platform/email/client", () => ({
  getResendClient: jest.fn(),
}));

import type { NextRequest } from "next/server";
import { GET } from "../route";
import { getSupabaseClient } from "@/platform/supabase";
import { scrapeWebsite } from "@/features/price-search/service";
import { getResendClient } from "@/platform/email/client";

const mockGetSupabaseClient = getSupabaseClient as unknown as jest.Mock;
const mockScrapeWebsite = scrapeWebsite as unknown as jest.Mock;
const mockGetResendClient = getResendClient as unknown as jest.Mock;

function makeRequest(authHeader?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (authHeader !== undefined) {
    headers["Authorization"] = authHeader;
  }
  return new Request("https://quiendamenos.com/api/cron/check-prices", {
    headers,
  }) as unknown as NextRequest;
}

describe("GET /api/cron/check-prices", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when Authorization header is missing", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 401 when Authorization header has wrong token", async () => {
    const res = await GET(makeRequest("Bearer wrong-token"));
    expect(res.status).toBe(401);
  });

  it("returns 503 when Supabase client is null", async () => {
    mockGetSupabaseClient.mockReturnValue(null);
    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(503);
  });

  it("returns 200 with checked/notified/skipped on happy path", async () => {
    const mockAlert = {
      id: "1",
      email: "user@example.com",
      product_url: "https://store.com/product/123",
      product_name: "iPhone 15 Pro",
      last_known_price: 1000,
      created_at: "2024-01-01T00:00:00Z",
      notified_at: null,
      unsubscribed_at: null,
    };

    const mockProduct = {
      url: "https://store.com/product/123",
      name: "iPhone 15 Pro",
      price: 900,
    };

    const mockUpdateChain = {
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          is: jest.fn().mockResolvedValue({ data: [mockAlert], error: null }),
        }),
        update: jest.fn().mockReturnValue(mockUpdateChain),
      }),
    };

    mockGetSupabaseClient.mockReturnValue(mockSupabase);
    mockScrapeWebsite.mockResolvedValue([mockProduct]);

    const mockResend = {
      emails: {
        send: jest
          .fn()
          .mockResolvedValue({ data: { id: "email-1" }, error: null }),
      },
    };
    mockGetResendClient.mockReturnValue(mockResend);

    const res = await GET(makeRequest("Bearer test-secret"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("checked");
    expect(body).toHaveProperty("notified");
    expect(body).toHaveProperty("skipped");
    expect(typeof body.checked).toBe("number");
    expect(typeof body.notified).toBe("number");
    expect(typeof body.skipped).toBe("number");
  });
});
