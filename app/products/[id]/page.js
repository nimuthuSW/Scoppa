import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/app/components/AddToCartButton'

export default async function ProductPage({ params }) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
  })

  if (!product) return notFound()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
      <img
        src={product.image}
        alt={product.name}
        style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px' }}
      />
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{product.name}</h1>
        <p style={{ color: '#666', marginTop: '1rem', fontSize: '1.1rem' }}>{product.description}</p>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '1.5rem' }}>
          ${product.price.toFixed(2)}
        </p>
        <p style={{ color: '#999', marginTop: '0.5rem' }}>{product.stock} in stock</p>
        <AddToCartButton product={product} />
      </div>
    </div>
  )
}