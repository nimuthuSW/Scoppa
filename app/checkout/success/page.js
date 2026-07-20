import { stripe } from '@/lib/stripe'
import { fulfillOrder } from '@/lib/orders'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SuccessRedirect from './SuccessRedirect'

export const metadata = { title: 'Order complete — sċoppa' }

export default async function CheckoutSuccessPage({ searchParams }) {
  const { session_id: sessionId } = await searchParams
  if (!sessionId) redirect('/cart')

  let orderId = null
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status === 'paid' && session.metadata?.orderId) {
      const order = await fulfillOrder(session.metadata.orderId)
      orderId = order.id
    }
  } catch (err) {
    console.error('Could not verify Stripe payment:', err)
  }

  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in-up">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">We couldn&apos;t verify your payment</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          If you were charged, your order will appear in your order history shortly.
          Otherwise, your cart is untouched and you can try again.
        </p>
        <div className="flex gap-3">
          <Link
            href="/orders"
            className="px-6 py-3 border border-indigo-100 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
          >
            My Orders
          </Link>
          <Link
            href="/cart"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-sm hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-200"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    )
  }

  return <SuccessRedirect orderId={orderId} />
}
