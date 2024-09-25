export interface Product {
  from: string;
  name: string | undefined;
  price: number | undefined;
  image: string;
  url: string | null | undefined
  brand: string;
  installment?: string;
}
