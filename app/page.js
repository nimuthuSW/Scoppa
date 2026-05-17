import Link from 'next/link'

export default function Home() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">
        Welcome to MyStore
      </h1>
      <p className="text-xl text-gray-500 mb-8">
        Quality products delivered to your door
      </p>
      <Link
        href="/products"
        className="bg-black text-white px-8 py-4 rounded-lg text-lg hover:bg-gray-800"
      >
        Shop Now
      </Link>
    </div>
  )
}