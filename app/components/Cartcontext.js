'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

// Only keep the fields the cart actually needs. Prices shown here are a
// snapshot for display — the server recomputes everything at checkout.
function toCartItem(product) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    stock: product.stock,
  }
}

function clampQuantity(quantity, stock) {
  const max = Number.isInteger(stock) ? stock : 99
  return Math.max(1, Math.min(quantity, max, 99))
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cart')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setCart(parsed)
      }
    } catch {
      localStorage.removeItem('cart')
    }
  }, [])

  const saveCart = (newCart) => {
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const addToCart = (product, quantity = 1) => {
    if (product.stock < 1) return
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      saveCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: clampQuantity(item.quantity + quantity, product.stock), stock: product.stock }
          : item
      ))
    } else {
      saveCart([...cart, { ...toCartItem(product), quantity: clampQuantity(quantity, product.stock) }])
    }
  }

  const removeFromCart = (id) => {
    saveCart(cart.filter(item => item.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return removeFromCart(id)
    saveCart(cart.map(item =>
      item.id === id ? { ...item, quantity: clampQuantity(quantity, item.stock) } : item
    ))
  }

  const clearCart = () => saveCart([])

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
