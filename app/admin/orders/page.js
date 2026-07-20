import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/admin'
import { updateOrderStatus } from '../actions'
import OrderStatusBadge, { ORDER_STATUSES } from '@/app/components/OrderStatusBadge'
import Link from 'next/link'

export const metadata = { title: 'Orders — sċoppa admin' }

export default async function AdminOrdersPage() {
  await requireAdminPage()

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="animate-fade-in">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-400 mt-1 text-sm">{orders.length} total</p>
        </div>
        <Link
          href="/admin"
          className="px-5 py-2.5 border border-indigo-100 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150"
        >
          ← Products
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-slate-400 py-16">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-semibold text-slate-900">#{order.id.slice(-8).toUpperCase()}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    {order.user.name ?? order.user.email} ·{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-slate-500 mt-2 truncate">
                    {order.items.map(item => `${item.quantity}× ${item.product.name}`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <p className="font-bold text-slate-900">${order.total.toFixed(2)}</p>
                  <form action={updateOrderStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={order.id} />
                    <select
                      name="status"
                      defaultValue={order.status}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {ORDER_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      Update
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
