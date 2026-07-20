'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/app/components/Cartcontext'

// Payment succeeded: empty the (localStorage-backed) cart, then hand the
// user over to their order confirmation page.
export default function SuccessRedirect({ orderId }) {
  const { clearCart } = useCart()
  const router = useRouter()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    clearCart()
    router.replace(`/orders/${orderId}`)
  }, [clearCart, router, orderId])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-5" />
      <p className="text-slate-500">Payment received — finalizing your order…</p>
    </div>
  )
}
