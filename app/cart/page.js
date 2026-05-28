'use client'

import { useCart } from '@/app/components/Cartcontext'
import Link from 'next/link'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart()

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in-up">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
        <p className="text-slate-400 mb-8">Add some products to get started.</p>
        <Link
          href="/products"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-200"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-fade-in-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-slate-900 truncate">{item.name}</h2>
                <p className="text-slate-400 text-sm">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-lg cursor-pointer"
                >
                  −
                </button>
                <span className="font-semibold w-6 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-lg cursor-pointer"
                >
                  +
                </button>
              </div>
              <p className="font-bold text-slate-900 w-20 text-right flex-shrink-0 text-sm">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-slate-300 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0 text-lg"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit animate-fade-in-up animation-delay-200">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Shipping</span>
              <span className="text-emerald-600 font-medium">Free</span>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between font-bold text-slate-900">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <Link
            href="/checkout"
            className="block mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center py-3.5 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-200"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
