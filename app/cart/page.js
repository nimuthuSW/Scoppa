'use client'

import { useCart } from '@/app/components/Cartcontext'
import Link from 'next/link'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart()

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Your cart is empty</h1>
        <Link href="/products" style={{
          display: 'inline-block',
          marginTop: '1.5rem',
          background: 'black',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          textDecoration: 'none',
        }}>
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Your Cart</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          {cart.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              background: 'white',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}>
              <img
                src={item.image}
                alt={item.name}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontWeight: '600' }}>{item.name}</h2>
                <p style={{ color: '#666' }}>${item.price.toFixed(2)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer' }}>
                  −
                </button>
                <span style={{ fontWeight: '600', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer' }}>
                  +
                </button>
              </div>
              <p style={{ fontWeight: 'bold', minWidth: '80px', textAlign: 'right' }}>
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button onClick={() => removeFromCart(item.id)}
                style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
                ✕
              </button>
            </div>
          ))}
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          height: 'fit-content',
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>Order Summary</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <hr />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <Link href="/checkout" style={{
            display: 'block',
            marginTop: '1.5rem',
            background: 'black',
            color: 'white',
            padding: '1rem',
            borderRadius: '8px',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: '600',
          }}>
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}