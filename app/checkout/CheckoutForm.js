'use client'

import { useCart } from '@/app/components/Cartcontext'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import ProductImage from '@/app/components/ProductImage'
import { PAYMENT_METHODS } from '@/lib/payments'

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-indigo-200 transition-colors'

const SUBMIT_LABELS = {
  card: ['Pay with Stripe', 'Redirecting to payment...'],
  bank_transfer: ['Place Order', 'Placing order...'],
  cod: ['Place Order', 'Placing order...'],
}

export default function CheckoutForm({ paymentMethods }) {
  const { cart, totalPrice, clearCart } = useCart()
  const { data: session } = useSession()
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0] ?? null)
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

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
          paymentMethod,
          shipping: {
            name: form.get('name'),
            phone: form.get('phone'),
            address: form.get('address'),
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      if (data.url) {
        // Hand off to Stripe Checkout — the cart is cleared only after
        // payment succeeds, so cancelling keeps it intact.
        window.location.assign(data.url)
        return
      }

      // Bank transfer / cash on delivery: the order is placed.
      clearCart()
      router.replace(`/orders/${data.orderId}`)
    } catch {
      setError('Could not reach the server. Please check your connection and try again.')
      setLoading(false)
    }
  }

  const [submitLabel, loadingLabel] = SUBMIT_LABELS[paymentMethod] ?? SUBMIT_LABELS.cod

  return (
    <form onSubmit={handlePlaceOrder} className="animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Delivery Details</h2>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                  <input id="name" name="name" type="text" required maxLength={100} autoComplete="name" defaultValue={session.user.name ?? ''} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                  <input id="phone" name="phone" type="tel" required maxLength={20} autoComplete="tel" className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1.5">Delivery address</label>
                <textarea id="address" name="address" required rows={3} maxLength={500} autoComplete="street-address" className={inputClass} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Method</h2>
            {paymentMethods.length === 0 ? (
              <p className="bg-amber-50 text-amber-700 text-sm px-4 py-3 rounded-xl border border-amber-100">
                Checkout is unavailable right now — no payment methods are set up.
              </p>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map(method => (
                  <label
                    key={method}
                    className={`flex items-start gap-3 bg-white p-4 rounded-2xl border shadow-sm cursor-pointer transition-all ${
                      paymentMethod === method
                        ? 'border-indigo-400 ring-2 ring-indigo-100'
                        : 'border-slate-100 hover:border-indigo-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="mt-1 accent-indigo-600"
                    />
                    <span>
                      <span className="block font-semibold text-slate-900">{PAYMENT_METHODS[method].label}</span>
                      <span className="block text-sm text-slate-400">{PAYMENT_METHODS[method].description}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section>
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
          </section>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit lg:sticky lg:top-24 animate-fade-in-up animation-delay-200">
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
            type="submit"
            disabled={loading || !paymentMethod}
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm transition-all duration-200 cursor-pointer"
          >
            {loading ? loadingLabel : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}
