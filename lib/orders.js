import { prisma } from './prisma'

// Marks a paid order as confirmed and decrements stock. Safe to call more
// than once (webhook + success page can race): only a 'pending' order is
// fulfilled, and everything runs in one transaction.
export async function fulfillOrder(orderId) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) throw new Error(`Order ${orderId} not found`)
    if (order.status !== 'pending') return order

    for (const item of order.items) {
      const decremented = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      })
      // The customer already paid, so if stock ran out in the meantime we
      // still confirm the order and floor the stock at zero.
      if (decremented.count === 0) {
        await tx.product.updateMany({
          where: { id: item.productId },
          data: { stock: 0 },
        })
      }
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: 'confirmed' },
    })
  })
}

// Cancels an order whose Stripe Checkout session expired without payment.
export async function cancelOrder(orderId) {
  return prisma.order.updateMany({
    where: { id: orderId, status: 'pending' },
    data: { status: 'cancelled' },
  })
}
