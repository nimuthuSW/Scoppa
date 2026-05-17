import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '4rem' }}>✅</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '1rem' }}>Order Confirmed!</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>Order ID: {order.id}</p>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontWeight: '600', marginBottom: '1rem' }}>Items Ordered</h2>
        {order.items.map(item => (
          <div key={item.id} style={{
            display: 'flex', gap: '1rem', alignItems: 'center',
            paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid #eee',
          }}>
            <img
              src={item.product.image}
              alt={item.product.name}
              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600' }}>{item.product.name}</p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Qty: {item.quantity}</p>
            </div>
            <p style={{ fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '1rem' }}>
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center' }}>
        <Link href="/orders" style={{
          padding: '0.75rem 1.5rem', border: '1px solid #ddd',
          borderRadius: '8px', textDecoration: 'none', color: '#333',
        }}>
          View All Orders
        </Link>
        <Link href="/products" style={{
          padding: '0.75rem 1.5rem', background: 'black',
          color: 'white', borderRadius: '8px', textDecoration: 'none',
        }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}