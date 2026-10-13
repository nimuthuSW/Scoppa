import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductImage from '@/app/components/ProductImage'
import OrderStatusBadge from '@/app/components/OrderStatusBadge'
import { orderReference, paymentMethodLabel } from '@/lib/payments'
import { getBankTransferDetails } from '@/lib/payment-config'

export const metadata = { title: 'Order details — sċoppa' }

const STATUS_HEADINGS = {
  pending: { icon: '⏳', title: 'Order Pending Payment' },
  confirmed: { icon: '✓', title: 'Order Confirmed!' },
  shipped: { icon: '🚚', title: 'Order Shipped' },
  delivered: { icon: '📦', title: 'Order Delivered' },
  cancelled: { icon: '✕', title: 'Order Cancelled' },
}

export default async function OrderPage({ params }) {
  const { id } = await params
  const session = await auth()

  if (!session) notFound()

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
    },
  })

  if (!order || order.userId !== session.user.id) notFound()

  const reference = orderReference(order.id)
  const awaitingTransfer =
    order.paymentMethod === 'bank_transfer' && !order.paidAt && order.status !== 'cancelled'
  const bankDetails = awaitingTransfer ? getBankTransferDetails() : null
  const heading = order.status === 'pending' && order.paymentMethod === 'bank_transfer'
    ? { icon: '🏦', title: 'Awaiting Bank Transfer' }
    : STATUS_HEADINGS[order.status] ?? STATUS_HEADINGS.confirmed

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl shadow-md shadow-indigo-100">
          {heading.icon}
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{heading.title}</h1>
        <p className="text-slate-400 text-sm mt-2 font-mono">Order #{reference}</p>
        <div className="mt-3">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fade-in-up animation-delay-150">
        <h2 className="font-semibold text-slate-900 mb-5">Items Ordered</h2>
        <div className="divide-y divide-slate-50">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <ProductImage
                src={item.product.image}
                alt={item.product.name}
                sizes="64px"
                className="w-16 h-16 rounded-xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{item.product.name}</p>
                <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between font-bold text-lg">
          <span className="text-slate-900">Total</span>
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            ${order.total.toFixed(2)}
          </span>
        </div>
      </div>

      {awaitingTransfer && (
        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 mt-6 animate-fade-in-up animation-delay-150">
          <h2 className="font-semibold text-amber-900 mb-2">Complete your bank transfer</h2>
          <p className="text-sm text-amber-800 mb-4">
            Transfer <strong>${order.total.toFixed(2)}</strong> to the account below, using{' '}
            <strong className="font-mono">{reference}</strong>
            {' as the payment reference. We’ll confirm your order once the payment arrives.'}
          </p>
          {bankDetails ? (
            <pre className="bg-white rounded-xl border border-amber-100 p-4 text-sm text-slate-800 whitespace-pre-wrap font-sans">
              {bankDetails}
            </pre>
          ) : (
            <p className="text-sm text-amber-800">Please contact us for our bank details.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 animate-fade-in-up animation-delay-150">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-3">Payment</h2>
          <p className="text-sm text-slate-700">{paymentMethodLabel(order.paymentMethod)}</p>
          <p className="text-sm text-slate-400 mt-1">
            {order.paidAt
              ? `Paid on ${new Date(order.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
              : order.status === 'cancelled'
                ? 'Not paid'
                : order.paymentMethod === 'cod'
                  ? `Pay $${order.total.toFixed(2)} in cash on delivery`
                  : 'Awaiting payment'}
          </p>
        </div>
        {order.shippingAddress && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-3">Delivery</h2>
            <p className="text-sm text-slate-700">{order.shippingName}</p>
            <p className="text-sm text-slate-500 whitespace-pre-line">{order.shippingAddress}</p>
            <p className="text-sm text-slate-400 mt-1">{order.shippingPhone}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-8 justify-center animate-fade-in-up animation-delay-300">
        <Link
          href="/orders"
          className="px-6 py-3 border border-indigo-100 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
        >
          View All Orders
        </Link>
        <Link
          href="/products"
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-200"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
