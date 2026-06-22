/** @jest-environment node */
import { GET } from "../route";
import { NextRequest } from "next/server";

jest.mock("@/platform/supabase", () => ({
  getSupabaseClient: jest.fn(),
}));

jest.mock("@/platform/alerts/token", () => ({
  verifyToken: jest.fn(),
}));

import { getSupabaseClient } from "@/platform/supabase";
import { verifyToken } from "@/platform/alerts/token";

const mockGetClient = getSupabaseClient as jest.Mock;
const mockVerifyToken = verifyToken as jest.Mock;

function makeRequest(params: {
  email?: string;
  url?: string;
  token?: string;
}): NextRequest {
  const searchParams = new URLSearchParams();
  if (params.email) searchParams.set("email", params.email);
  if (params.url) searchParams.set("url", params.url);
  if (params.token) searchParams.set("token", params.token);
  return new NextRequest(
    `http://localhost/api/price-alerts/unsubscribe?${searchParams.toString()}`,
  );
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/price-alerts/unsubscribe", () => {
  it("returns 400 when token is invalid", async () => {
    mockVerifyToken.mockReturnValue(false);
    mockGetClient.mockReturnValue({});

    const req = makeRequest({
      email: "user@example.com",
      url: "https://store.com/p/1",
      token: "invalid-token",
    });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 503 when Supabase client is null", async () => {
    mockVerifyToken.mockReturnValue(true);
    mockGetClient.mockReturnValue(null);

    const req = makeRequest({
      email: "user@example.com",
      url: "https://store.com/p/1",
      token: "valid-token",
    });
    const res = await GET(req);
    expect(res.status).toBe(503);
  });

  it("returns 200 HTML confirmation on valid token and successful update", async () => {
    mockVerifyToken.mockReturnValue(true);
    const updateFn = jest.fn().mockReturnThis();
    const eqUrlFn = jest.fn().mockResolvedValue({ error: null });
    const supabase = {
      from: jest.fn().mockReturnValue({
        update: updateFn,
        eq: jest
          .fn()
          .mockReturnValueOnce({ eq: eqUrlFn })
          .mockReturnValueOnce({ eq: eqUrlFn }),
      }),
    };
    mockGetClient.mockReturnValue(supabase);

    const req = makeRequest({
      email: "user@example.com",
      url: "https://store.com/p/1",
      token: "valid-token",
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const contentType = res.headers.get("content-type");
    expect(contentType).toContain("text/html");
    const body = await res.text();
    expect(body).toContain("Dejaste de seguir");
  });

  it("returns 400 when required query params are missing", async () => {
    mockVerifyToken.mockReturnValue(false);
    const req = makeRequest({ email: "user@example.com" }); // missing url and token
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});
