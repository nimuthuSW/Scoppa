'use client'

import { useCart } from '@/app/components/Cartcontext'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart()
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Your cart is empty</h1>
        <Link href="/products" style={{
          display: 'inline-block', marginTop: '1.5rem', background: 'black',
          color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none',
        }}>
          Continue Shopping
        </Link>
      </div>
    )
  }

  if (!session) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Please login to checkout</h1>
        <Link href="/auth/login" style={{
          display: 'inline-block', marginTop: '1.5rem', background: 'black',
          color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none',
        }}>
          Login
        </Link>
      </div>
    )
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, total: totalPrice }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
    } else {
      clearCart()
      router.push(`/orders/${data.orderId}`)
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>Order Items</h2>
          {cart.map(item => (
            <div key={item.id} style={{
              display: 'flex', gap: '1rem', alignItems: 'center',
              background: 'white', padding: '1rem', borderRadius: '12px',
              marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}>
              <img
                src={item.image}
                alt={item.name}
                style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600' }}>{item.name}</p>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Qty: {item.quantity}</p>
              </div>
              <p style={{ fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div style={{
          background: 'white', padding: '1.5rem', borderRadius: '12px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)', height: 'fit-content',
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>Summary</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Subtotal</span><span>${totalPrice.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Shipping</span><span>Free</span>
          </div>
          <hr />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <span>Total</span><span>${totalPrice.toFixed(2)}</span>
          </div>
          <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
            Logged in as: {session.user.email}
          </p>
          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            style={{
              width: '100%', marginTop: '1.5rem', padding: '1rem',
              background: 'black', color: 'white', borderRadius: '8px',
              border: 'none', fontSize: '1rem', cursor: 'pointer',
            }}
          >
            {loading ? 'Placing order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  )
}