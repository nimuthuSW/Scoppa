import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ProductImage from '@/app/components/ProductImage'

export const metadata = { title: 'Products — sċoppa' }

export default async function ProductsPage({ searchParams }) {
  const { category, q } = await searchParams
  const query = typeof q === 'string' ? q.trim() : ''

  const where = {
    ...(category ? { category } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        }
      : {}),
  }

  const [products, categoryGroups] = await Promise.all([
    prisma.product.findMany({
      where,
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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {category ?? 'All Products'}
          </h1>
          <p className="text-slate-400 mt-1 text-sm">{products.length} items</p>
        </div>

        <form action="/products" className="flex gap-2">
          {category && <input type="hidden" name="category" value={category} />}
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search products..."
            className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-indigo-200 transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all cursor-pointer"
          >
            Search
          </button>
        </form>
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
            href={`/products?category=${encodeURIComponent(group.category)}`}
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

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center animate-fade-in-up">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No products found</h2>
          <p className="text-slate-400 mb-6">
            {query ? <>Nothing matches &ldquo;{query}&rdquo;.</> : 'Nothing in this category yet.'}
          </p>
          <Link href="/products" className="text-indigo-600 font-semibold hover:text-violet-600 transition-colors">
            View all products →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <Link
              href={`/products/${product.id}`}
              key={product.id}
              className="group block animate-fade-in-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1 transition-all duration-200">
                <div className="relative">
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-56"
                    imageClassName="group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.stock < 1 && (
                    <span className="absolute top-3 right-3 bg-slate-900/80 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Out of stock
                    </span>
                  )}
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
      )}
    </div>
  )
}
