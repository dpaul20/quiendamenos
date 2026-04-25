import { batchInsertSnapshots } from "../insert";

const mockInsert = jest.fn().mockResolvedValue({ error: null });
const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });

jest.mock("@/platform/supabase", () => ({
  getSupabaseClient: jest.fn(),
}));

import { getSupabaseClient } from "@/platform/supabase";
const mockGetClient = getSupabaseClient as jest.Mock;

const product = {
  from: "Fravega",
  name: "iPhone 15",
  price: 1200.5,
  url: "https://fravega.com/p/iphone",
  image: "https://img.com/iphone.jpg",
  brand: "Apple",
  installment: 12,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("batchInsertSnapshots", () => {
  it("inserta snapshots con price_cents correcto", async () => {
    mockGetClient.mockReturnValue({ from: mockFrom });

    await batchInsertSnapshots([product], "iphone");

    expect(mockFrom).toHaveBeenCalledWith("price_snapshots");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          store: "Fravega",
          price_cents: 120050,
          url: "https://fravega.com/p/iphone",
        }),
      ]),
    );
  });

  it("retorna silenciosamente cuando el cliente es null", async () => {
    mockGetClient.mockReturnValue(null);

    await expect(
      batchInsertSnapshots([product], "iphone"),
    ).resolves.toBeUndefined();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("no inserta si no hay productos con precio y url", async () => {
    mockGetClient.mockReturnValue({ from: mockFrom });

    await batchInsertSnapshots(
      [{ ...product, price: undefined as unknown as number }],
      "iphone",
    );
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
