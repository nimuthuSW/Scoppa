'use client'

import { useCart } from './Cartcontext'

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart()

  return (
    <button
      onClick={() => addToCart(product)}
      className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-xl font-semibold text-base shadow-md hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer"
    >
      Add to Cart
    </button>
  )
}
