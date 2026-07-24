/** @jest-environment node */

jest.mock("@/scrapers", () => ({
  scrapers: {},
}));

import { GET } from "../route";
import { scrapers } from "@/scrapers";

const mockScrapers = scrapers as Record<
  string,
  (query: string) => Promise<unknown[]>
>;

function setScrapers(map: Record<string, () => Promise<unknown[]>>): void {
  for (const key of Object.keys(mockScrapers)) delete mockScrapers[key];
  Object.assign(mockScrapers, map);
}

async function readBody(res: Response) {
  return (await res.json()) as {
    status: string;
    stores: Record<string, { status: string; count: number; error?: string }>;
  };
}

describe("GET /api/health", () => {
  afterEach(() => setScrapers({}));

  it("marca 'empty' a una tienda que resuelve sin resultados", async () => {
    setScrapers({
      fravega: async () => [{ id: 1 }],
      naldo: async () => [],
    });

    const body = await readBody(await GET());

    expect(body.stores.fravega.status).toBe("ok");
    expect(body.stores.naldo.status).toBe("empty");
    expect(body.stores.naldo.count).toBe(0);
  });

  it("degrada el estado general cuando una tienda viene vacía", async () => {
    setScrapers({
      fravega: async () => [{ id: 1 }],
      naldo: async () => [],
    });

    const res = await GET();
    const body = await readBody(res);

    expect(body.status).toBe("degraded");
    expect(res.status).toBe(200);
  });

  it("reporta 'down' con 503 cuando todas las tiendas vienen vacías o caídas", async () => {
    setScrapers({
      naldo: async () => [],
      fravega: async () => {
        throw new Error("boom");
      },
    });

    const res = await GET();
    const body = await readBody(res);

    expect(body.status).toBe("down");
    expect(res.status).toBe(503);
  });

  it("reporta 'ok' cuando todas las tiendas traen resultados", async () => {
    setScrapers({
      fravega: async () => [{ id: 1 }],
      naldo: async () => [{ id: 2 }],
    });

    const res = await GET();
    const body = await readBody(res);

    expect(body.status).toBe("ok");
    expect(res.status).toBe(200);
  });

  it("distingue una tienda que lanza (down) de una vacía (empty)", async () => {
    setScrapers({
      caida: async () => {
        throw new Error("timeout");
      },
      vacia: async () => [],
    });

    const body = await readBody(await GET());

    expect(body.stores.caida.status).toBe("down");
    expect(body.stores.caida.error).toBe("timeout");
    expect(body.stores.vacia.status).toBe("empty");
    expect(body.stores.vacia.error).toBeUndefined();
  });
});
