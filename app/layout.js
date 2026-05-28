import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'
import { CartProvider } from './components/Cartcontext'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'sċoppa',
  description: 'A modern e-commerce store',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <SessionProvider>
          <CartProvider>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              {children}
            </main>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
