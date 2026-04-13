import BrandFilter from "@/components/BrandFilter";
import SearchForm from "@/components/SearchForm";

export default function SearchRow() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full sm:max-w-[800px]">
      <BrandFilter />
      <SearchForm />
    </div>
  );
}
