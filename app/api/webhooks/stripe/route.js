import { stripe } from '@/lib/stripe'
import { fulfillOrder, cancelOrder } from '@/lib/orders'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !stripe) {
    console.error('STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY is not set — rejecting webhook')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const payload = await req.text()
  const signature = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (err) {
    console.error('Invalid Stripe webhook signature:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    const session = event.data.object
    const orderId = session.metadata?.orderId

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        if (orderId && session.payment_status === 'paid') {
          await fulfillOrder(orderId)
        }
        break
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed':
        if (orderId) {
          await cancelOrder(orderId)
        }
        break
    }
  } catch (err) {
    console.error(`Stripe webhook ${event.type} failed:`, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
