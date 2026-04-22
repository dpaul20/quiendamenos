import { capitalize } from "@/lib/capitalize";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { httpClient } from "@/platform/http";

interface MeliAttribute {
  id: string;
  value_name?: string;
}

interface MeliResult {
  title: string;
  price: number;
  thumbnail: string;
  permalink: string;
  attributes: MeliAttribute[];
}

interface MeliSearchResponse {
  results: MeliResult[];
}

export async function scrapeMercadoLibre(query: string): Promise<Product[]> {
  const url = `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&limit=50`;
  try {
    const { data } = await httpClient.get<MeliSearchResponse>(url);
    return data.results.map((item) => {
      const brandAttr = item.attributes.find((a) => a.id === "BRAND");
      const brand = capitalize(brandAttr?.value_name ?? "Unknown");
      const image = item.thumbnail.replace(/-I\.jpg$/, "-O.jpg");
      return {
        name: item.title,
        price: item.price,
        from: StoreNamesEnum.MERCADOLIBRE,
        image,
        url: item.permalink,
        brand,
      };
    });
  } catch (error) {
    console.error("Error fetching products from MercadoLibre:", error);
    return [];
  }
}
