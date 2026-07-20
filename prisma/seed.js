require('dotenv/config')
const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const { PrismaLibSql } = require('@prisma/adapter-libsql')
const bcrypt = require('bcryptjs')

const url = process.env.DATABASE_URL ?? 'file:./dev.db'
const adapter = /^(libsql:|wss:|https:)/.test(url)
  ? new PrismaLibSql({ url, authToken: process.env.DATABASE_AUTH_TOKEN })
  : new PrismaBetterSqlite3({ url })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Clear existing data (dev only)
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()

  await prisma.product.createMany({
    data: [
      // ── Clothing ──────────────────────────────────────────────
      {
        name: 'Classic White T-Shirt',
        description: 'A comfortable everyday white t-shirt made from 100% organic cotton. Relaxed fit, pre-shrunk, and built to last.',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        stock: 50,
        category: 'Clothing',
      },
      {
        name: 'Slim Fit Jeans',
        description: 'Modern slim fit jeans in classic blue denim. Stretch fabric for all-day comfort with a tailored silhouette.',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
        stock: 30,
        category: 'Clothing',
      },
      {
        name: 'Hooded Sweatshirt',
        description: 'A heavyweight cotton-blend hoodie with a kangaroo pocket and adjustable drawstring. Perfect for layering.',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600',
        stock: 40,
        category: 'Clothing',
      },
      {
        name: 'Linen Shirt',
        description: 'Breathable 100% linen shirt with a relaxed fit. Ideal for warm days, dressed up or down.',
        price: 54.99,
        image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600',
        stock: 25,
        category: 'Clothing',
      },
      {
        name: 'Floral Summer Dress',
        description: 'A light, flowy midi dress with a delicate floral print. Features an adjustable waist tie and flutter sleeves.',
        price: 74.99,
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
        stock: 20,
        category: 'Clothing',
      },
      {
        name: 'Wool Overcoat',
        description: 'Tailored double-breasted overcoat in warm wool blend. A timeless investment piece for colder months.',
        price: 219.99,
        image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600',
        stock: 12,
        category: 'Clothing',
      },

      // ── Footwear ──────────────────────────────────────────────
      {
        name: 'Running Sneakers',
        description: 'Lightweight and breathable sneakers with responsive foam cushioning. Built for speed and all-day wear.',
        price: 119.99,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
        stock: 20,
        category: 'Footwear',
      },
      {
        name: 'Chelsea Boots',
        description: 'Sleek leather Chelsea boots with elastic side panels and a stacked heel. Pairs with anything.',
        price: 164.99,
        image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600',
        stock: 15,
        category: 'Footwear',
      },
      {
        name: 'Canvas Slip-Ons',
        description: 'Minimalist canvas slip-on shoes with a vulcanised rubber sole. Lightweight and effortlessly cool.',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600',
        stock: 35,
        category: 'Footwear',
      },
      {
        name: 'Leather Loafers',
        description: 'Polished penny loafers in full-grain leather. A refined look that works from office to weekend.',
        price: 144.99,
        image: 'https://images.unsplash.com/photo-1582897085656-c636d006a246?w=600',
        stock: 18,
        category: 'Footwear',
      },
      {
        name: 'Trail Running Shoes',
        description: 'Rugged trail shoes with aggressive outsole grip and a waterproof membrane for off-road adventures.',
        price: 134.99,
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600',
        stock: 22,
        category: 'Footwear',
      },

      // ── Accessories ───────────────────────────────────────────
      {
        name: 'Leather Wallet',
        description: 'Slim genuine leather bifold wallet with 6 card slots and a hidden bill compartment. Ages beautifully.',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600',
        stock: 40,
        category: 'Accessories',
      },
      {
        name: 'Canvas Tote Bag',
        description: 'Sturdy 12oz canvas tote with interior zip pocket and reinforced straps. The everyday carry-all.',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600',
        stock: 45,
        category: 'Accessories',
      },
      {
        name: 'Aviator Sunglasses',
        description: 'Classic metal-frame aviators with UV400 polarised lenses. Timeless style with modern protection.',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600',
        stock: 30,
        category: 'Accessories',
      },
      {
        name: 'Minimalist Watch',
        description: 'Clean-dial analogue watch with a sapphire crystal face and genuine leather strap. Japanese quartz movement.',
        price: 199.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        stock: 15,
        category: 'Accessories',
      },
      {
        name: 'Leather Belt',
        description: 'Full-grain leather belt with a brushed-silver buckle. Available in black and tan. Cut to fit.',
        price: 44.99,
        image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600',
        stock: 28,
        category: 'Accessories',
      },

      // ── Sports ────────────────────────────────────────────────
      {
        name: 'Performance Running Shorts',
        description: 'Lightweight 4-inch running shorts with built-in liner and reflective trim. Quick-dry, sweat-wicking fabric.',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1539794830467-1f1755804d13?w=600',
        stock: 50,
        category: 'Sports',
      },
      {
        name: 'Compression Leggings',
        description: 'High-waist compression leggings with flatlock seams and a hidden waistband pocket. Four-way stretch.',
        price: 64.99,
        image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600',
        stock: 35,
        category: 'Sports',
      },
      {
        name: 'Gym Backpack',
        description: 'Spacious 30L gym bag with a ventilated shoe compartment and padded laptop sleeve.',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
        stock: 20,
        category: 'Sports',
      },
      {
        name: 'Resistance Bands Set',
        description: 'Set of 5 latex resistance bands in graduated strengths. Includes carry pouch and exercise guide.',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=600',
        stock: 60,
        category: 'Sports',
      },
      {
        name: 'Insulated Water Bottle',
        description: '32oz double-wall vacuum insulated bottle. Keeps drinks cold 24h, hot 12h. Leak-proof lid.',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600',
        stock: 55,
        category: 'Sports',
      },
    ],
  })

  console.log('✅ 21 products seeded across 4 categories!')

  // Promote (or create) the store admin from env vars, so no credentials
  // live in the repo. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim()
  const adminPassword = process.env.ADMIN_PASSWORD
  if (adminEmail && adminPassword && adminPassword.length >= 8) {
    const hashed = await bcrypt.hash(adminPassword, 10)
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: 'admin' },
      create: { name: 'Admin', email: adminEmail, password: hashed, role: 'admin' },
    })
    console.log(`✅ Admin user ready: ${adminEmail}`)
  } else {
    console.log('ℹ️  Skipped admin user (set ADMIN_EMAIL and ADMIN_PASSWORD ≥ 8 chars in .env)')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
