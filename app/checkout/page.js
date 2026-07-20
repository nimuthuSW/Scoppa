'use client'

import { useCart } from '@/app/components/Cartcontext'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import ProductImage from '@/app/components/ProductImage'

export default function CheckoutPage() {
  const { cart, totalPrice } = useCart()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in-up">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Your cart is empty</h1>
        <Link
          href="/products"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-200"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in-up">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Please login to checkout</h1>
        <Link
          href="/auth/login"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-200"
        >
          Login
        </Link>
      </div>
    )
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      // Hand off to Stripe Checkout — the cart is cleared only after
      // payment succeeds, so cancelling keeps it intact.
      window.location.assign(data.url)
    } catch {
      setError('Could not reach the server. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Items</h2>
          <div className="space-y-3">
            {cart.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-fade-in-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <ProductImage
                  src={item.image}
                  alt={item.name}
                  sizes="64px"
                  className="w-16 h-16 rounded-xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                  <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit animate-fade-in-up animation-delay-200">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Summary</h2>
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
          <p className="text-xs text-slate-400 mt-3">Logged in as {session.user.email}</p>
          {error && (
            <div className="mt-3 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm transition-all duration-200 cursor-pointer"
          >
            {loading ? 'Redirecting to payment...' : 'Pay with Stripe'}
          </button>
        </div>
      </div>
    </div>
  )
}
