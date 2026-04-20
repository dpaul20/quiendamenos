import { StoreNamesEnum } from "@/enums/stores.enum";
import { createVtexScraper } from "@/platform/vtex/helpers";

export const scrapeCetrogar = createVtexScraper(
  "https://www.cetrogar.com.ar",
  StoreNamesEnum.CETROGAR,
);
