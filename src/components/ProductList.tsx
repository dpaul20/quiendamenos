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
import mercadolibre from "../../public/stores/mercadolibre.png";
import { StoreNamesEnum } from "@/enums/stores.enum";
import { useProductsStore } from "@/store/products.store";
import { ALL } from "@/lib/constants";
import { Badge } from "./ui/badge";
import { loadingMessages } from "@/lib/loading-messages ";
import { useEffect, useState } from "react";

const storeLogos: Record<StoreNamesEnum, StaticImageData> = {
  Cetrogar: cetrogar,
  Fravega: fravega,
  Musimundo: musimundo,
  Naldo: naldo,
  Carrefour: carrefour,
  MercadoLibre: mercadolibre,
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
      (product) => product.brand.toUpperCase() === selectedBrand,
    );
  }

  if (isLoading)
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <Image
          src="/logo.png"
          alt="Logo"
          width={64}
          height={64}
          className="rotate-45 animate-bell"
        />
        <p className="mt-4 animate-pulse text-lg">{loadingMessage}</p>
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

      <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product, index) => {
          if (!product.price || !product.name || !product.url) {
            return null;
          }
          return (
            <Card
              key={index}
              className="flex flex-col items-center justify-between gap-1 rounded-xl p-2 shadow-md transition-shadow duration-300 hover:shadow-lg lg:p-4"
            >
              <Link href={product.url} target="_blank">
                <h3 className="text-center text-xs font-semibold uppercase tracking-tight lg:text-base">
                  {product.name}
                </h3>
              </Link>
              <div className="flex w-full flex-row justify-between gap-1">
                <Image
                  loader={imageLoader}
                  src={product.image}
                  alt={product.name ?? "Product image"}
                  width={100}
                  height={100}
                  className="object-contain"
                />
                <div className="flex flex-col justify-between gap-1">
                  <div className="flex flex-col items-center justify-between gap-1">
                    <p className="text-sm font-bold text-green-600 lg:text-2xl">
                      {product.price.toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      })}
                    </p>
                    <span className="text-center text-xs uppercase text-muted-foreground lg:text-sm">
                      {product.brand}
                    </span>
                  </div>
                  <div className="mx-auto max-h-6 max-w-max rounded-md bg-primary px-2 py-1 text-primary-foreground">
                    <Image
                      src={storeLogos[product.from]}
                      alt={product.from}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {product?.installment ? (
                    <Badge className="mx-auto bg-orange-500 text-xs lg:text-sm">
                      {product.installment} cuotas sin interés
                    </Badge>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
