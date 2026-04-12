import axios from "axios";
import { capitalize } from "@/lib/capitalize";
import { MusimundoProductSource } from "@/types/musimundo";
import { Product } from "@/types/product";
import { StoreNamesEnum } from "@/enums/stores.enum";

export async function scrapeMusimundo(query: string): Promise<Product[]> {
  try {
    const url = `https://u.braindw.com/els/musimundoapi?ft=${query}&qt=100&sc=emsa&refreshmetadata=true&exclusive=0&aggregations=true`;
    const { data } = await axios.get(url);

    const products: Product[] = data?.hits?.hits?.map(
      (hit: { _source: MusimundoProductSource }) => {
        const product = hit._source;
        return {
          name: product.Descripcion,
          price: Number.parseFloat(product.Precio.replaceAll(/[^0-9,-]+/g, "")),
          from: StoreNamesEnum.MUSIMUNDO,
          image: product.UrlImagen,
          url: product.Link,
          brand: capitalize(product.Marca),
          installment:
            Number(product.Cuota_Numero) > 1 ? product.Cuota_Numero : 0,
        };
      },
    );

    if (!products) return [];
    return products;
  } catch (error) {
    console.error("Error fetching products from Musimundo:", error);
    return [];
  }
}
