import SearchForm from "../components/SearchForm";
import ProductList from "../components/ProductList";
import BrandFilter from "../components/BrandFilter";
import Disclaimer from "../components/Disclaimer";
import Header from "../components/Header";
import FooterAlert from "../components/FooterAlert";
import { ModeToggle } from "@/components/DarkMode";

export default async function Home() {
  return (
    <main className="container mx-auto space-y-4 px-4 my-3 lg:p-0">
      <ModeToggle />

      <Disclaimer />

      <Header />

      <SearchForm />

      <BrandFilter />
      
      <ProductList />

      <FooterAlert />
    </main>
  );
}
