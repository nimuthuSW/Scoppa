import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function ProductsPage() {
  const products = await prisma.product.findMany()

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        All Products
      </h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5rem',
      }}>
        {products.map((product) => (
          <Link href={`/products/${product.id}`} key={product.id} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              cursor: 'pointer',
            }}>
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <div style={{ padding: '1rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1a1a1a' }}>
                  {product.name}
                </h2>
                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {product.description}
                </p>
                <p style={{ fontSize: '1.3rem', fontWeight: 'bold', marginTop: '0.75rem' }}>
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}