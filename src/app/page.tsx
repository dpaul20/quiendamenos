import SearchForm from "../components/SearchForm";
import ProductList from "../components/ProductList";
import BrandFilter from "../components/BrandFilter";
import Disclaimer from "../components/Disclaimer";
import MissionModal from "../components/MissionModal";
import { ModeToggle } from "@/components/DarkMode";
import Image from "next/image";
import { Footer } from "@/components/Footer";
import { StoresList } from "@/components/StoresList";

export default async function Home() {
  return (
    <main className="h-screen flex flex-col justify-between">
      <div className="w-full max-w-5xl flex flex-col mx-auto space-y-4 px-4 py-2">
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={64}
              height={64}
              className="rotate-45"
            />

            <MissionModal />
          </div>

          <ModeToggle />
        </div>

        <div className="order-1 lg:order-none">
          <Disclaimer />
        </div>

        <div className="w-full flex flex-col-reverse lg:flex-row justify-between gap-2">
          <BrandFilter />

          <div className=" w-full flex justify-end">
            <SearchForm />
          </div>
        </div>
        <StoresList />

        <ProductList />
      </div>

      <Footer />
    </main>
  );
}
