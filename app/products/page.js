import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function ProductsPage({ searchParams }) {
  const { category } = await searchParams

  const [products, categoryGroups] = await Promise.all([
    prisma.product.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'asc' },
    }),
    prisma.product.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { category: 'asc' },
    }),
  ])

  const totalCount = categoryGroups.reduce((sum, g) => sum + g._count.id, 0)

  return (
    <div>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-slate-900">
          {category ?? 'All Products'}
        </h1>
        <p className="text-slate-400 mt-1 text-sm">{products.length} items</p>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 flex-wrap mb-8 animate-fade-in-up animation-delay-100">
        <Link
          href="/products"
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
            !category
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
          }`}
        >
          All <span className="ml-1 opacity-60">{totalCount}</span>
        </Link>
        {categoryGroups.map(group => (
          <Link
            key={group.category}
            href={`/products?category=${group.category}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
              category === group.category
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
            }`}
          >
            {group.category} <span className="ml-1 opacity-60">{group._count.id}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <Link
            href={`/products/${product.id}`}
            key={product.id}
            className="group block animate-fade-in-up"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1 transition-all duration-200">
              <div className="overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <span className="text-xs font-medium text-indigo-400 uppercase tracking-wide">
                  {product.category}
                </span>
                <h2 className="font-semibold text-slate-900 text-lg leading-snug mt-1">{product.name}</h2>
                <p className="text-slate-400 text-sm mt-1.5 line-clamp-2">{product.description}</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mt-4">
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
