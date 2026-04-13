import Disclaimer from "../components/Disclaimer";
import ProductList from "@/components/ProductList";
import { Footer } from "@/components/Footer";
import { StoresList } from "@/components/StoresList";
import { StoreFilter } from "@/components/StoreFilter";
import SearchRow from "@/components/SearchRow";
import { Header } from "@/components/Header";

export default async function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="w-full max-w-5xl flex flex-col mx-auto px-6 py-8 flex-1 gap-6">
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
          <SearchRow />
        </section>

        <StoresList />
        <StoreFilter />
        <ProductList />
      </div>

      <Footer />
    </main>
  );
}
