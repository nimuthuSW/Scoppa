'use client'

import { useState } from 'react'
import { useCart } from './Cartcontext'

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  if (product.stock < 1) {
    return (
      <button
        disabled
        className="mt-8 w-full bg-slate-200 text-slate-400 py-4 rounded-xl font-semibold text-base cursor-not-allowed"
      >
        Out of Stock
      </button>
    )
  }

  const maxQuantity = Math.min(product.stock, 99)

  const handleAdd = () => {
    addToCart(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-slate-700">Quantity</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-lg cursor-pointer"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="font-semibold w-8 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={quantity >= maxQuantity}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-xl font-semibold text-base shadow-md hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer"
      >
        {added ? 'Added to Cart ✓' : 'Add to Cart'}
      </button>
    </div>
  )
}
