import BrandFilter from "@/components/BrandFilter";
import SearchForm from "@/components/SearchForm";

export default function SearchRow() {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full max-w-2xl mt-2">
      <BrandFilter />
      <SearchForm />
    </div>
  );
}
