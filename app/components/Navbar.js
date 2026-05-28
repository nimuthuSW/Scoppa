'use client'

import Link from 'next/link'
import { useCart } from './Cartcontext'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const { totalItems } = useCart()
  const { data: session } = useSession()

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent hover:from-indigo-500 hover:to-violet-500 transition-all duration-200"
          >
            sċoppa
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/products" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors duration-150">
              Products
            </Link>
            <Link href="/cart" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors duration-150">
              🛒 Cart
              {totalItems > 0 && (
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link href="/orders" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors duration-150">
              Orders
            </Link>

            {session ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">Hi, {session.user.name}</span>
                <button
                  onClick={() => signOut()}
                  className="text-sm border border-slate-200 px-4 py-2 rounded-lg hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-150 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md hover:shadow-indigo-200 hover:-translate-y-px transition-all duration-150"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
