import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function ProductsPage() {
  const products = await prisma.product.findMany()

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">All Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link href={`/products/${product.id}`} key={product.id}>
            <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-56 object-cover rounded-t-xl"
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {product.name}
                </h2>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-xl font-bold text-gray-900 mt-3">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}