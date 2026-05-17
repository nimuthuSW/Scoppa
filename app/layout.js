import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'
import { CartProvider } from './components/Cartcontext'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MyStore',
  description: 'A modern e-commerce store',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <CartProvider>
            <Navbar />
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
              {children}
            </main>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  )
}