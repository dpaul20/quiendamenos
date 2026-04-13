import BrandFilter from "@/components/BrandFilter";
import SearchForm from "@/components/SearchForm";

export default function SearchRow() {
  return (
    <div className="flex gap-4 items-center w-full max-w-3xl">
      <BrandFilter />
      <SearchForm />
    </div>
  );
}
