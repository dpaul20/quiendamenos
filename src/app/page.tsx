import SearchForm from "../components/SearchForm";
import ProductList from "../components/ProductList";
import BrandFilter from "../components/BrandFilter";
import Disclaimer from "../components/Disclaimer";
import { ModeToggle } from "@/components/DarkMode";
import Image from "next/image";
import { Footer } from "@/components/Footer";
import { StoresList } from "@/components/StoresList";
import { StoreFilter } from "@/components/StoreFilter";

export default async function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="w-full max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Image
                src="/logo.png"
                alt="Logo"
                width={18}
                height={18}
                className="rotate-45 brightness-0 invert"
              />
            </div>
            <span className="font-semibold text-sm tracking-tight">
              Scraping Electronica
            </span>
          </div>
          <ModeToggle />
        </div>
      </header>

      {/* Page content */}
      <div className="w-full max-w-5xl flex flex-col mx-auto px-4 py-6 md:py-8 flex-1 gap-6">
        <Disclaimer />

        {/* Hero */}
        <section className="flex flex-col items-center gap-3 pt-2 pb-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-center">
            ¿Quién da menos?
          </h1>
          <p className="text-muted-foreground text-sm md:text-base text-center max-w-lg">
            Compará precios de electrónica en las principales tiendas de
            Argentina
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full max-w-2xl mt-2">
            <BrandFilter />
            <SearchForm />
          </div>
        </section>

        <StoreFilter />
        <StoresList />
        <ProductList />
      </div>

      <Footer />
    </main>
  );
}
