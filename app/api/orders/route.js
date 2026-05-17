import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  const { items, total } = await req.json()

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
  }

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      total,
      status: 'confirmed',
      items: {
        create: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
  })

  return NextResponse.json({ orderId: order.id })
}

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}