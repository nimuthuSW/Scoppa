const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: 'Classic White T-Shirt',
        description: 'A comfortable everyday white t-shirt made from 100% cotton.',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        stock: 50,
      },
      {
        name: 'Slim Fit Jeans',
        description: 'Modern slim fit jeans in classic blue denim.',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
        stock: 30,
      },
      {
        name: 'Running Sneakers',
        description: 'Lightweight and breathable sneakers perfect for running.',
        price: 119.99,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        stock: 20,
      },
      {
        name: 'Leather Wallet',
        description: 'Slim genuine leather wallet with card slots.',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500',
        stock: 40,
      },
    ],
  })
  console.log('✅ Products seeded!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())