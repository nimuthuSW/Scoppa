import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          MyStore
        </Link>
        <div className="flex gap-6 items-center">
          <Link href="/products" className="text-gray-600 hover:text-gray-900">
            Products
          </Link>
          <Link href="/cart" className="text-gray-600 hover:text-gray-900">
            🛒 Cart
          </Link>
          <Link href="/auth/login" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
            Login
          </Link>
        </div>
      </div>
    </nav>
  )
}