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
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>My Orders</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>You have no orders yet.</p>
          <Link href="/products" style={{
            display: 'inline-block', marginTop: '1.5rem', background: 'black',
            color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none',
          }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} style={{
            background: 'white', borderRadius: '12px', padding: '1.5rem',
            marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontWeight: '600' }}>Order #{order.id.slice(-8)}</p>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  background: '#e8f5e9', color: '#2e7d32',
                  padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem',
                }}>
                  {order.status}
                </span>
                <p style={{ fontWeight: 'bold', marginTop: '0.25rem' }}>${order.total.toFixed(2)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {order.items.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>x{item.quantity}</span>
                </div>
              ))}
            </div>
            <Link href={`/orders/${order.id}`} style={{
              display: 'inline-block', marginTop: '1rem', color: 'black',
              fontWeight: '600', fontSize: '0.9rem', textDecoration: 'underline',
            }}>
              View Details →
            </Link>
          </div>
        ))
      )}
    </div>
  )
}