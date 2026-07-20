import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ProductImage from '@/app/components/ProductImage'

// Category tiles come from the database — render per-request so admin
// changes show up without a rebuild.
export const dynamic = 'force-dynamic'

const CATEGORY_META = {
  Clothing: {
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800',
    emoji: '👗',
  },
  Footwear: {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    emoji: '👟',
  },
  Accessories: {
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    emoji: '⌚',
  },
  Sports: {
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
    emoji: '🏃',
  },
}

export default async function Home() {
  const categoryGroups = await prisma.product.groupBy({
    by: ['category'],
    _count: { id: true },
    orderBy: { category: 'asc' },
  })

  return (
    <div>
      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center min-h-[60vh] text-center px-4 overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-40 -z-10 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-100 rounded-full blur-3xl opacity-30 -z-10 animate-blob animation-delay-400" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10 animate-blob animation-delay-700" />

        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-5 animate-fade-in">
            Free shipping on all orders
          </p>
          <h1 className="text-6xl font-bold text-slate-900 leading-tight mb-6 animate-fade-in-up animation-delay-100">
            Shop What<br />You Love
          </h1>
          <p className="text-xl text-slate-500 mb-10 leading-relaxed animate-fade-in-up animation-delay-200">
            Quality products, handpicked for you and delivered to your door.
          </p>
          <div className="flex gap-4 justify-center animate-fade-in-up animation-delay-300">
            <Link
              href="/products"
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-xl text-base font-semibold shadow-md hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200"
            >
              Shop All
            </Link>
            <Link
              href="/orders"
              className="border-2 border-indigo-100 text-indigo-700 bg-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200"
            >
              My Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-16 animate-fade-in-up animation-delay-400">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Shop by Category</h2>
          <Link href="/products" className="text-sm font-medium text-indigo-600 hover:text-violet-600 transition-colors">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryGroups.map((group, index) => {
            const meta = CATEGORY_META[group.category] ?? { image: null, emoji: '🛍️' }
            return (
              <Link
                key={group.category}
                href={`/products?category=${encodeURIComponent(group.category)}`}
                className="group block animate-fade-in-up"
                style={{ animationDelay: `${500 + index * 80}ms` }}
              >
                <div className="relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1 transition-all duration-300">
                  <ProductImage
                    src={meta.image}
                    alt={group.category}
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="w-full h-full absolute inset-0"
                    imageClassName="group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-bold text-xl leading-tight">{group.category}</p>
                    <p className="text-white/60 text-sm mt-0.5">{group._count.id} items</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
