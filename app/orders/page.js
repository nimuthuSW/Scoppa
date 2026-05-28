import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function OrdersPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8 animate-fade-in-up">My Orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in-up">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-slate-400 text-lg mb-6">You have no orders yet.</p>
          <Link
            href="/products"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-200"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50 hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <p className="font-semibold text-slate-900">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-100">
                    {order.status}
                  </span>
                  <p className="font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mt-1.5">
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {order.items.map(item => (
                  <div key={item.id} className="relative">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-xl border border-slate-100"
                    />
                    {item.quantity > 1 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                        {item.quantity}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <Link href={`/orders/${order.id}`} className="inline-block mt-4 text-sm font-semibold text-indigo-600 hover:text-violet-600 transition-colors">
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
