"use client";
import Image, { StaticImageData } from "next/image";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { imageLoader } from "@/lib/image-loader";
import cetrogar from "../../public/stores/cetrogar.webp";
import fravega from "../../public/stores/fravega.webp";
import musimundo from "../../public/stores/musimundo.webp";
import naldo from "../../public/stores/naldo.webp";
import carrefour from "../../public/stores/carrefour.webp";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { useProductsStore } from "@/store/products.store";
import { ALL } from "@/lib/constants";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";
import { loadingMessages } from "@/lib/loading-messages ";
import { useEffect, useState } from "react";

const storeLogos: Record<StoreNamesEnum, StaticImageData> = {
  Cetrogar: cetrogar,
  Fravega: fravega,
  Musimundo: musimundo,
  Naldo: naldo,
  Carrefour: carrefour,
};

export default function ProductList() {
  const { products, selectedBrand, isLoading } = useProductsStore();
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    if (isLoading) {
      const simulateLoading = async () => {
        for (const message of loadingMessages) {
          setLoadingMessage(message);
          await new Promise((resolve) => setTimeout(resolve, 1500)); // Espera 1.5 segundos entre cada mensaje
        }
      };
      simulateLoading();
    }
  }, [isLoading]);

  let filteredProducts = products;
  if (selectedBrand !== ALL) {
    filteredProducts = products.filter(
      (product) => product.brand.toUpperCase() === selectedBrand
    );
  }

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-lg animate-pulse">{loadingMessage}</p>
      </div>
    );

  if (filteredProducts.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col">
      <div>
        <Badge variant="secondary">Productos ordenados por menor precio</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
        {filteredProducts.map((product, index) => {
          if (!product.price || !product.name || !product.url) {
            return null;
          }
          return (
            <Card
              key={index}
              className="flex flex-col items-center p-2 lg:p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 gap-1"
            >
              <Link href={product.url} target="_blank">
                <h3 className="text-xs lg:text-base font-semibold tracking-tight text-center uppercase">
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
                    <span className="text-xs lg:text-sm text-center uppercase text-muted-foreground">
                      {product.brand}
                    </span>
                  </div>
                  <div className="max-w-max max-h-6 px-2 py-1 rounded-md mx-auto bg-primary text-primary-foreground">
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
    </div>
  );
}
