"use client";

import SearchForm from "@/components/SearchForm";
import ProductList from "@/components/ProductList";
import BrandFilter from "@/components/BrandFilter";
import { Loader2, MoveRight, RocketIcon } from "lucide-react";
import { capitalize } from "@/lib/capitalize";
import { useProducts } from "@/hooks/useProducts";
import Disclaimer from "@/components/Disclaimer";
import Image from "next/image";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const {
    products,
    filteredProducts,
    isLoading,
    selectedBrand,
    handleSearch,
    handleBrandChange,
  } = useProducts();

  const brands = Array.from(
    new Set(products.map((product) => capitalize(product.brand)))
  );

  return (
    <main className="container mx-auto space-y-4 px-4 my-3 lg:p-0">
      <Disclaimer />
      <div className="flex flex-col lg:flex-row justify-center lg:justify-between items-center gap-4">
        <div className="flex flex-col lg:flex-row justify-center items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={64} height={64} />
          <h1 className="text-2xl lg:text-4xl font-bold text-center text-green-600">
            ¿Quién da menos...?
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-center gap-2">
          <Alert className="flex flex-row items-center gap-2 px-2 py-1 lg:px-4 lg:py-3">
            <AlertDescription className="text-xs text-center">
              ¿Conseguiste el mejor precio?
            </AlertDescription>
            <div className="hidden lg:block h-4 w-4">
              <MoveRight className="h-full w-full top-1/2 right-2" />
            </div>
          </Alert>
          <Link
            href="https://cafecito.app/quien-da-menos"
            rel="noopener"
            target="_blank"
          >
            <Image
              src="https://cdn.cafecito.app/imgs/buttons/button_4.png"
              width={192}
              height={40}
              alt="Invitame un café en cafecito.app"
              className="h-9 lg:h-auto max-h-10 max-w-48"
            />
          </Link>
        </div>
      </div>

      <SearchForm onSearch={handleSearch} />
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      {filteredProducts.length > 0 && (
        <>
          <BrandFilter
            brands={brands}
            selectedBrand={selectedBrand}
            onBrandChange={handleBrandChange}
          />
          <ProductList products={filteredProducts} />
        </>
      )}
      <Alert className="max-w-lg bg-green-200 text-center mx-auto">
        <RocketIcon className="h-4 w-4" />
        <AlertTitle>En &quot;¿Quién da menos?&quot;,</AlertTitle>
        <AlertDescription>
          creemos en la transparencia y en la posibilidad de ofrecer a los
          consumidores las mejores opciones de compra.
        </AlertDescription>
        <AlertDescription>
          Invitamos a todas las empresas y tiendas a compartir sus APIs con
          nosotros para participar en una plataforma donde la competencia se
          basa en la calidad y los precios más competitivos.
        </AlertDescription>
        <br />
        <AlertDescription>
          Con mucho esfuerzo y dedicación,{" "}
          <Link
            href="https://deivygutierrez.com"
            target="_blank"
            className="font-bold underline text-green-900"
          >
            Deivy Gutierrez
          </Link>
        </AlertDescription>
      </Alert>
    </main>
  );
}
