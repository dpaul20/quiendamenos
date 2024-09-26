import { Product } from "@/types/product";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { capitalize } from "@/lib/capitalize";

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: Readonly<ProductListProps>) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
      {products.map((product, index) => {
        if (!product.price || !product.name || !product.url) {
          return null;
        }
        return (
          <Card
            key={index}
            className="flex flex-col items-center p-2 lg:p-4 bg-white rounded-xl shadow-md border-green-200 hover:shadow-lg transition-shadow duration-300 gap-1"
          >
            <Link href={product.url} target="_blank">
              <h3 className="text-xs lg:text-sm font-semibold text-gray-800 capitalize text-center">
                {capitalize(product.name)}
              </h3>
            </Link>
            <div className="w-full flex flex-row justify-center gap-1">
              <Image
                src={product.image}
                alt={product.name ?? "Product image"}
                width={100}
                height={100}
                className="object-contain"
              />
              <div className="flex flex-col justify-center gap-1">
                <div className="flex flex-col justify-center items-center gap-1">
                  <p className="text-sm lg:text-2xl font-bold text-green-600">
                    {product.price.toLocaleString("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    })}
                  </p>
                  <p className="text-xs lg:text-sm text-gray-500 text-center">
                    {product.brand}
                  </p>
                </div>
                <div className="text-xs rounded-full bg-orange-100 text-orange-600 px-2 py-1 text-center">
                  {product.from}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
