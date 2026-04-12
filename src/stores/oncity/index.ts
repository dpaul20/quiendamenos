import { StoreNamesEnum } from "@/enums/stores.enum";
import { createVtexScraper } from "@/platform/vtex/helpers";

export const scrapeOnCity = createVtexScraper(
  "https://www.oncity.com",
  StoreNamesEnum.ONCITY,
);
