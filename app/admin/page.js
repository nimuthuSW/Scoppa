import { prisma } from '@/lib/prisma'
import { requireAdminPage, getCategories } from '@/lib/admin'
import { deleteProduct } from './actions'
import ProductImage from '@/app/components/ProductImage'
import Link from 'next/link'

export const metadata = { title: 'Admin — sċoppa' }

const STOCK_FILTERS = {
  low: { label: 'Low stock (1–5)', where: { stock: { gte: 1, lte: 5 } } },
  out: { label: 'Out of stock', where: { stock: { lt: 1 } } },
}

const filterInputClass =
  'px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-indigo-200 transition-colors'

export default async function AdminPage({ searchParams }) {
  await requireAdminPage()
  const { error, q, category, stock } = await searchParams
  const query = typeof q === 'string' ? q.trim() : ''
  const categoryFilter = typeof category === 'string' ? category : ''
  const stockFilter = STOCK_FILTERS[stock] ? stock : ''
  const isFiltered = Boolean(query || categoryFilter || stockFilter)

  const where = {
    ...(categoryFilter ? { category: categoryFilter } : {}),
    ...(stockFilter ? STOCK_FILTERS[stockFilter].where : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        }
      : {}),
  }

  const [products, totalProducts, categories, orderCount, pendingCount] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { createdAt: 'asc' } }),
    prisma.product.count(),
    getCategories(),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ['confirmed', 'pending'] } } }),
  ])

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {totalProducts} products · {orderCount} orders ({pendingCount} awaiting action)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/users"
            className="px-5 py-2.5 border border-indigo-100 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
          >
            Manage Users
          </Link>
          <Link
            href="/admin/orders"
            className="px-5 py-2.5 border border-indigo-100 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
          >
            Manage Orders
          </Link>
          <Link
            href="/admin/products/new"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-200"
          >
            + New Product
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <form action="/admin" className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search products..."
          aria-label="Search products"
          className={`${filterInputClass} sm:flex-1`}
        />
        <select name="category" defaultValue={categoryFilter} aria-label="Category" className={filterInputClass}>
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select name="stock" defaultValue={stockFilter} aria-label="Stock" className={filterInputClass}>
          <option value="">Any stock</option>
          {Object.entries(STOCK_FILTERS).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all cursor-pointer"
        >
          Filter
        </button>
        {isFiltered && (
          <Link
            href="/admin"
            className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-indigo-600 transition-colors text-center"
          >
            Clear
          </Link>
        )}
      </form>

      {isFiltered && (
        <p className="text-slate-400 text-sm mb-4">
          Showing {products.length} of {totalProducts} products
        </p>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Stock</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      sizes="40px"
                      className="w-10 h-10 rounded-lg flex-shrink-0"
                    />
                    <span className="font-medium text-slate-900">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-slate-500">{product.category}</td>
                <td className="px-6 py-3 text-slate-900 font-medium">${product.price.toFixed(2)}</td>
                <td className="px-6 py-3">
                  <span className={product.stock < 1 ? 'text-red-500 font-semibold' : product.stock <= 5 ? 'text-amber-600 font-semibold' : 'text-slate-500'}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-3 text-right whitespace-nowrap">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-indigo-600 font-semibold hover:text-violet-600 transition-colors mr-4"
                  >
                    Edit
                  </Link>
                  <form action={deleteProduct} className="inline">
                    <input type="hidden" name="id" value={product.id} />
                    <button
                      type="submit"
                      className="text-slate-400 font-semibold hover:text-red-500 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="text-center text-slate-400 py-10">
            {isFiltered ? 'No products match these filters.' : 'No products yet — add your first one.'}
          </p>
        )}
      </div>
    </div>
  )
}
