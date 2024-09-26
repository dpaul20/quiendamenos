"use client";
import { Product } from "@/types/product";
import Image, { StaticImageData } from "next/image";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { imageLoader } from "@/lib/image-loader";
import cetrogar from "../../public/stores/cetrogar.webp";
import fravega from "../../public/stores/fravega.webp";
import musimundo from "../../public/stores/musimundo.webp";
import naldo from "../../public/stores/naldo.webp";
import { StoreNamesEnum } from "@/enums/stores.enum";

const storeLogos: Record<StoreNamesEnum, StaticImageData> = {
  Cetrogar: cetrogar,
  Fravega: fravega,
  Musimundo: musimundo,
  Naldo: naldo,
};
interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: Readonly<ProductListProps>) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
      {products.map((product, index) => {
        if (!product.price || !product.name || !product.url) {
          return null;
        }
        return (
          <Card
            key={index}
            className="flex flex-col items-center p-2 lg:p-4 rounded-xl shadow-md border-green-200 hover:shadow-lg transition-shadow duration-300 gap-1"
          >
            <Link href={product.url} target="_blank">
              <h3 className="text-xs lg:text-base font-semibold text-gray-800 text-center uppercase">
                {product.name}
              </h3>
            </Link>
            <div className="w-full flex flex-row justify-center gap-1">
              <Image
                loader={imageLoader}
                src={product.image}
                alt={product.name ?? "Product image"}
                width={100}
                height={100}
                className="object-contain"
              />
              <div className="flex flex-col justify-center gap-1">
                <div className="flex flex-col justify-center items-center gap-1">
                  <p className="text-sm lg:text-2xl font-bold text-green-600">
                    {product.price.toLocaleString("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    })}
                  </p>
                  <p className="text-xs lg:text-sm text-gray-500 text-center uppercase">
                    {product.brand}
                  </p>
                </div>
                <div className="max-w-max max-h-6 bg-green-600 px-2 py-1 rounded-full mx-auto">
                  <Image
                    src={storeLogos[product.from]}
                    alt={product.from}
                    className="object-contain h-full w-full"
                  />
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
