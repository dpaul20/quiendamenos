import { Product } from '@/lib/types';
import Image from 'next/image';

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: Readonly<ProductListProps>) {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product, index) => (
        <li key={index} className="border p-4 rounded shadow">
          <Image src={product.image} alt={product.name} width={300} height={200} />
          <h6 className="text-sm text-gray-600">{product.from}</h6>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-green-600 font-bold">Precio: {product.price}</p>
          <p className="text-sm text-gray-600">Especificaciones: {product.specs}</p>
        </li>
      ))}
    </ul>
  );
}