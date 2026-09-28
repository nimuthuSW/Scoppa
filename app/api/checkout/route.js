import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const MAX_QUANTITY_PER_ITEM = 99

// Stripe only accepts absolute https image URLs. Uploaded images are stored
// as site-relative paths (/api/images/<id>), so resolve them against the
// site origin — and skip the image on plain-http origins like localhost.
function stripeImages(image, origin) {
  if (!image) return {}
  try {
    const url = new URL(image, origin)
    return url.protocol === 'https:' ? { images: [url.href] } : {}
  } catch {
    return {}
  }
}

export async function POST(req) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Please log in to check out.' }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const items = body?.items

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
    }

    // Only product ids and quantities are taken from the client —
    // prices and the total always come from the database.
    const requested = new Map()
    for (const item of items) {
      const quantity = Number.parseInt(item?.quantity, 10)
      if (
        typeof item?.id !== 'string' ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > MAX_QUANTITY_PER_ITEM
      ) {
        return NextResponse.json({ error: 'Invalid cart items.' }, { status: 400 })
      }
      requested.set(item.id, (requested.get(item.id) ?? 0) + quantity)
    }

    const products = await prisma.product.findMany({
      where: { id: { in: [...requested.keys()] } },
    })

    if (products.length !== requested.size) {
      return NextResponse.json(
        { error: 'Some items in your cart are no longer available. Please review your cart.' },
        { status: 400 }
      )
    }

    for (const product of products) {
      if (product.stock < requested.get(product.id)) {
        return NextResponse.json(
          { error: `Not enough stock for "${product.name}" — only ${product.stock} left.` },
          { status: 400 }
        )
      }
    }

    const total = products.reduce(
      (sum, product) => sum + product.price * requested.get(product.id),
      0
    )

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total: Math.round(total * 100) / 100,
        status: 'pending',
        items: {
          create: products.map(product => ({
            productId: product.id,
            quantity: requested.get(product.id),
            price: product.price,
          })),
        },
      },
    })

    const origin = req.headers.get('origin') ?? req.nextUrl.origin
    let checkoutSession
    try {
      checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: session.user.email,
        line_items: products.map(product => ({
          quantity: requested.get(product.id),
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(product.price * 100),
            product_data: {
              name: product.name,
              ...stripeImages(product.image, origin),
            },
          },
        })),
        metadata: { orderId: order.id },
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart`,
      })
    } catch (err) {
      // Payment never started — don't leave an orphaned pending order behind.
      await prisma
        .$transaction([
          prisma.orderItem.deleteMany({ where: { orderId: order.id } }),
          prisma.order.delete({ where: { id: order.id } }),
        ])
        .catch(() => {})
      throw err
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkoutSession.id },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('Checkout failed:', err)
    return NextResponse.json(
      { error: 'Something went wrong while starting checkout. Please try again.' },
      { status: 500 }
    )
  }
}
