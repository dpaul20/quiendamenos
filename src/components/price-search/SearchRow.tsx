import BrandFilter from "@/components/price-search/BrandFilter";
import SearchForm from "@/components/price-search/SearchForm";

export default function SearchRow() {
  return (
    <div className="flex gap-4 items-center w-full max-w-3xl">
      <BrandFilter />
      <SearchForm />
    </div>
  );
}
