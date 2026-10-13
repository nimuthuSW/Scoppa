import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth'
import { reserveStock, OutOfStockError } from '@/lib/orders'
import { getEnabledPaymentMethods } from '@/lib/payment-config'
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

function parseShipping(shipping) {
  const name = typeof shipping?.name === 'string' ? shipping.name.trim() : ''
  const phone = typeof shipping?.phone === 'string' ? shipping.phone.trim() : ''
  const address = typeof shipping?.address === 'string' ? shipping.address.trim() : ''

  if (!name || !phone || !address) {
    return { error: 'Please enter your name, phone number and delivery address.' }
  }
  if (name.length > 100 || address.length > 500) {
    return { error: 'Your name or address is too long.' }
  }
  if (!/^\+?[\d\s()-]{6,20}$/.test(phone)) {
    return { error: 'Please enter a valid phone number.' }
  }
  return { shippingName: name, shippingPhone: phone, shippingAddress: address }
}

function badRequest(error) {
  return NextResponse.json({ error }, { status: 400 })
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
      return badRequest('Your cart is empty.')
    }

    const paymentMethod = body?.paymentMethod
    if (!getEnabledPaymentMethods().includes(paymentMethod)) {
      return badRequest('Please choose a payment method.')
    }

    const shipping = parseShipping(body?.shipping)
    if (shipping.error) {
      return badRequest(shipping.error)
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
        return badRequest('Invalid cart items.')
      }
      requested.set(item.id, (requested.get(item.id) ?? 0) + quantity)
    }

    const products = await prisma.product.findMany({
      where: { id: { in: [...requested.keys()] } },
    })

    if (products.length !== requested.size) {
      return badRequest('Some items in your cart are no longer available. Please review your cart.')
    }

    const outOfStock = products.find(product => product.stock < requested.get(product.id))
    if (outOfStock) {
      return badRequest(`Not enough stock for "${outOfStock.name}" — only ${outOfStock.stock} left.`)
    }

    const total = products.reduce(
      (sum, product) => sum + product.price * requested.get(product.id),
      0
    )

    const orderData = {
      userId: session.user.id,
      total: Math.round(total * 100) / 100,
      paymentMethod,
      ...shipping,
      items: {
        create: products.map(product => ({
          productId: product.id,
          quantity: requested.get(product.id),
          price: product.price,
        })),
      },
    }

    if (paymentMethod !== 'card') {
      return placeOfflineOrder(orderData)
    }

    const order = await prisma.order.create({
      data: { ...orderData, status: 'pending' },
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
      { error: 'Something went wrong while placing your order. Please try again.' },
      { status: 500 }
    )
  }
}

// Bank transfer and cash on delivery: no online payment step, so the stock
// is reserved as soon as the order is placed. Bank transfer orders wait in
// 'pending' until an admin marks them paid; cash on delivery orders are
// confirmed straight away and marked paid when the cash is collected.
async function placeOfflineOrder(orderData) {
  try {
    const order = await prisma.$transaction(async tx => {
      await reserveStock(
        tx,
        orderData.items.create.map(({ productId, quantity }) => ({ productId, quantity }))
      )
      return tx.order.create({
        data: {
          ...orderData,
          status: orderData.paymentMethod === 'bank_transfer' ? 'pending' : 'confirmed',
          stockDeducted: true,
        },
      })
    })
    return NextResponse.json({ orderId: order.id })
  } catch (err) {
    if (err instanceof OutOfStockError) {
      return badRequest('Some items just sold out. Please review your cart.')
    }
    throw err
  }
}
