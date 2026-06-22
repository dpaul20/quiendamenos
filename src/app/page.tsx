import Disclaimer from "../components/Disclaimer";
import ProductList from "@/components/ProductList";
import { Footer } from "@/components/Footer";
import { StoresList } from "@/components/StoresList";
import { FilterPanel } from "@/components/FilterPanel";
import SearchRow from "@/components/SearchRow";
import { Header } from "@/components/Header";
import { ResultsHeader } from "@/components/ResultsHeader";
import CategoryChips from "@/components/CategoryChips";
import { ResultsOrchestrator } from "@/components/ResultsOrchestrator/ResultsOrchestrator";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="h-px w-full shrink-0 bg-border" />

      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-5 px-4 pb-10 pt-6 sm:px-10 lg:gap-8 lg:px-20 lg:pb-16 lg:pt-10">
        {/* Hero */}
        <section className="flex flex-col items-stretch gap-[10px] pb-4 pt-2 sm:items-center sm:gap-4 sm:pb-8 sm:pt-6">
          <h1 className="text-center text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            ¿Quién da menos?
          </h1>
          <p className="max-w-lg text-center text-sm text-muted-foreground sm:text-base">
            <span className="sm:hidden">
              Buscá y comparamos en Frávega, Cetrogar y más
            </span>
            <span className="hidden sm:inline">
              Buscá una vez y comparamos en Frávega, Cetrogar, Musimundo,
              Megatone y más — al mismo tiempo.
            </span>
          </p>
          <SearchRow />
          <CategoryChips />
        </section>

        <Disclaimer />

        <ResultsOrchestrator>
          <FilterPanel />
          <StoresList />
          <ResultsHeader />
          <ProductList />
        </ResultsOrchestrator>
      </div>

      <Footer />
    </main>
  );
}
