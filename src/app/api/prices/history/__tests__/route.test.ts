import { GET } from "../route";
import { NextRequest } from "next/server";

jest.mock("@/platform/supabase", () => ({
  getSupabaseClient: jest.fn(),
}));

import { getSupabaseClient } from "@/platform/supabase";
const mockGetClient = getSupabaseClient as jest.Mock;

function makeRequest(query?: string) {
  const url = query
    ? `http://localhost/api/prices/history?query=${encodeURIComponent(query)}`
    : "http://localhost/api/prices/history";
  return new NextRequest(url);
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/prices/history", () => {
  it("retorna 400 cuando no se pasa query", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("query is required");
  });

  it("retorna [] cuando el cliente Supabase es null", async () => {
    mockGetClient.mockReturnValue(null);
    const res = await GET(makeRequest("iphone"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("retorna [] cuando Supabase devuelve error", async () => {
    mockGetClient.mockReturnValue({
      rpc: jest
        .fn()
        .mockResolvedValue({ data: null, error: new Error("rpc error") }),
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        order: jest
          .fn()
          .mockResolvedValue({ data: null, error: new Error("query error") }),
      }),
    });

    const res = await GET(makeRequest("iphone"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });
});
