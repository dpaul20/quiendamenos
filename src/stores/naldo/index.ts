import { StoreNamesEnum } from "@/enums/stores.enum";
import { createVtexScraper } from "@/platform/vtex/helpers";

export const scrapeNaldo = createVtexScraper(
  "https://www.naldo.com.ar",
  StoreNamesEnum.NALDO,
);
