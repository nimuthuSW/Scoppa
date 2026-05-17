'use client'

import Link from 'next/link'
import { useCart } from './Cartcontext'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const { totalItems } = useCart()
  const { data: session } = useSession()

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #eee',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#1a1a1a' }}>
        MyStore
      </Link>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link href="/products" style={{ textDecoration: 'none', color: '#555' }}>
          Products
        </Link>
        <Link href="/cart" style={{ textDecoration: 'none', color: '#555' }}>
          🛒 Cart {totalItems > 0 && (
            <span style={{
              background: 'black',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 8px',
              fontSize: '0.75rem',
              marginLeft: '4px',
            }}>
              {totalItems}
            </span>
          )}
        </Link>
        {session ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: '#555' }}>Hi, {session.user.name}</span>
            <button
              onClick={() => signOut()}
              style={{ background: 'none', border: '1px solid #ddd', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link href="/auth/login" style={{
            background: 'black',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
          }}>
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}