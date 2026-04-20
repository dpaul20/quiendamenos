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
      <div className="w-full h-px bg-border shrink-0" />

      <div className="w-full max-w-[1280px] flex flex-col mx-auto px-4 sm:px-10 lg:px-20 pt-6 lg:pt-10 pb-10 lg:pb-16 flex-1 gap-5 lg:gap-8">
        {/* Hero */}
        <section className="flex flex-col items-center gap-[10px] sm:gap-4 pt-2 pb-4 sm:pt-6 sm:pb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-center">
            ¿Quién da menos?
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base text-center max-w-lg">
            <span className="sm:hidden">Buscá y comparamos en Frávega, Cetrogar y más</span>
            <span className="hidden sm:inline">
              Buscá una vez y comparamos en Frávega, Cetrogar, Musimundo,
              Megatone y más — al mismo tiempo.
            </span>
          </p>
          <SearchRow />
        </section>

        <Disclaimer />

        <StoreFilter />
        <StoresList />
        <ProductList />
      </div>

      <Footer />
    </main>
  );
}
