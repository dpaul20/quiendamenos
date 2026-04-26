import type { Product } from "@/types/product.d";

export interface ApiSuccessResponse {
  products: Product[];
}

export interface ApiErrorResponse {
  error: string;
}

export function buildSuccessResponse(products: Product[]): ApiSuccessResponse {
  return { products };
}

export function buildErrorResponse(message: string): ApiErrorResponse {
  return { error: message };
}
