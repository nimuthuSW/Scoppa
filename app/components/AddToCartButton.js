'use client'

import { useCart } from './Cartcontext'

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart()

  return (
    <button
      onClick={() => addToCart(product)}
      style={{
        marginTop: '2rem',
        background: 'black',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '8px',
        fontSize: '1rem',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      Add to Cart
    </button>
  )
}