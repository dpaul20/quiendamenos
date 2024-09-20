import { Product } from "@/lib/types";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: Readonly<ProductListProps>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
      {products.map((product, index) => (
        <Link key={index} href={product.url}>
          <Card className="flex items-center p-4 bg-white rounded-xl shadow-md">
            <div className="w-1/3 mr-4">
              <Image
                src={product.image}
                alt={product.name}
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 capitalize">
                {product.name}
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                ${product.price}
              </p>
              <p className="text-sm text-gray-500">($ {product.price} x 1)</p>
            </div>
            <div className="rounded-full bg-pink-500 text-white p-2">{product.from}</div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
