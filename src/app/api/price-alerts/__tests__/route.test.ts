/** @jest-environment node */
import { POST } from "../route";
import { NextRequest } from "next/server";

jest.mock("@/platform/supabase", () => ({
  getSupabaseClient: jest.fn(),
}));

import { getSupabaseClient } from "@/platform/supabase";
const mockGetClient = getSupabaseClient as jest.Mock;

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/price-alerts", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function makeSupabaseMock({
  countData = 0,
  countError = null,
  upsertError = null,
}: {
  countData?: number;
  countError?: unknown;
  upsertError?: unknown;
} = {}) {
  const selectFn = jest.fn().mockReturnThis();
  const eqFn = jest.fn().mockReturnThis();
  const isNullFn = jest.fn().mockReturnThis();
  const limitFn = jest.fn().mockReturnThis();
  const singleFn = jest.fn().mockResolvedValue({
    data: { count: countData },
    error: countError,
  });

  const onConflictFn = jest.fn().mockResolvedValue({ error: upsertError });

  const fromFn = jest.fn((table: string) => {
    if (table === "price_alerts") {
      return {
        select: selectFn,
        eq: eqFn,
        is: isNullFn,
        limit: limitFn,
        single: singleFn,
        upsert: jest.fn().mockReturnValue({ onConflict: onConflictFn }),
      };
    }
    return {};
  });

  return { from: fromFn };
}

beforeEach(() => jest.clearAllMocks());

describe("POST /api/price-alerts", () => {
  it("returns 503 when Supabase client is null", async () => {
    mockGetClient.mockReturnValue(null);
    const req = makeRequest({
      email: "user@example.com",
      productUrl: "https://store.com/p/1",
      productName: "iPhone",
      currentPrice: 100000,
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
  });

  it("returns 400 when email is missing", async () => {
    mockGetClient.mockReturnValue(makeSupabaseMock());
    const req = makeRequest({
      productUrl: "https://store.com/p/1",
      productName: "iPhone",
      currentPrice: 100000,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/email/i);
  });

  it("returns 400 when email format is invalid", async () => {
    mockGetClient.mockReturnValue(makeSupabaseMock());
    const req = makeRequest({
      email: "not-an-email",
      productUrl: "https://store.com/p/1",
      productName: "iPhone",
      currentPrice: 100000,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/email/i);
  });

  it("returns 400 when productUrl is missing", async () => {
    mockGetClient.mockReturnValue(makeSupabaseMock());
    const req = makeRequest({
      email: "user@example.com",
      productName: "iPhone",
      currentPrice: 100000,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 429 when alert limit (10) is reached", async () => {
    const supabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: { count: 10 }, error: null }),
        upsert: jest.fn().mockReturnValue({
          onConflict: jest.fn().mockResolvedValue({ error: null }),
        }),
      }),
    };
    mockGetClient.mockReturnValue(supabase);

    const req = makeRequest({
      email: "user@example.com",
      productUrl: "https://store.com/p/new",
      productName: "New Product",
      currentPrice: 50000,
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toMatch(/limit/i);
  });

  it("returns 200 { ok: true } on successful new subscription", async () => {
    const supabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: { count: 0 }, error: null }),
        upsert: jest.fn().mockReturnValue({
          onConflict: jest.fn().mockResolvedValue({ error: null }),
        }),
      }),
    };
    mockGetClient.mockReturnValue(supabase);

    const req = makeRequest({
      email: "user@example.com",
      productUrl: "https://store.com/p/1",
      productName: "iPhone",
      currentPrice: 100000,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
