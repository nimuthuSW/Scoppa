import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/app/components/AddToCartButton'

export default async function ProductPage({ params }) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
  })

  if (!product) return notFound()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
      <div className="rounded-2xl overflow-hidden bg-slate-100 shadow-sm animate-fade-in">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-[480px] object-cover"
        />
      </div>

      <div className="py-2 animate-fade-in-up animation-delay-100">
        <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
        <p className="text-slate-500 mt-4 text-base leading-relaxed">{product.description}</p>

        <div className="mt-6">
          <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            ${product.price.toFixed(2)}
          </p>
          <p className="text-sm mt-1.5">
            {product.stock > 0 ? (
              <span className="text-emerald-600 font-medium">{product.stock} in stock</span>
            ) : (
              <span className="text-red-500 font-medium">Out of stock</span>
            )}
          </p>
        </div>

        <AddToCartButton product={product} />
      </div>
    </div>
  )
}
