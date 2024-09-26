import { StoreNamesEnum } from "@/enums/stores.enum";

export interface Product {
  from: StoreNamesEnum;
  name: string | undefined;
  price: number | undefined;
  image: string;
  url: string | null | undefined;
  brand: string;
  installment?: string;
}
