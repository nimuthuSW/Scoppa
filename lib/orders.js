import { prisma } from './prisma'

export class OutOfStockError extends Error {}

// Deducts every item's quantity from stock, failing if any product doesn't
// have enough left. Run inside a transaction so a failure rolls back the
// items already deducted.
export async function reserveStock(tx, items) {
  for (const item of items) {
    const decremented = await tx.product.updateMany({
      where: { id: item.productId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    })
    if (decremented.count === 0) {
      throw new OutOfStockError(item.productId)
    }
  }
}

// Marks a paid card order as confirmed and decrements stock. Safe to call
// more than once (webhook + success page can race): only a 'pending' order
// is fulfilled, and everything runs in one transaction.
export async function fulfillOrder(orderId) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) throw new Error(`Order ${orderId} not found`)
    if (order.status !== 'pending' || order.paymentMethod !== 'card') return order

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
      data: { status: 'confirmed', paidAt: new Date(), stockDeducted: true },
    })
  })
}

// Cancels a card order whose Stripe Checkout session expired without payment.
export async function cancelOrder(orderId) {
  return prisma.order.updateMany({
    where: { id: orderId, status: 'pending', paymentMethod: 'card' },
    data: { status: 'cancelled' },
  })
}

// Admin cancellation: puts the order's items back in stock if they were
// deducted.
export async function cancelOrderAndRestock(orderId) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })
    if (!order || order.status === 'cancelled') return order

    if (order.stockDeducted) {
      for (const item of order.items) {
        await tx.product.updateMany({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: 'cancelled', stockDeducted: false },
    })
  })
}

// Admin confirmation that a bank transfer arrived or cash was collected.
// A bank transfer order awaiting payment moves on to 'confirmed'.
export async function markOrderPaid(orderId) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order || order.paidAt || order.status === 'cancelled') return order

  return prisma.order.update({
    where: { id: orderId },
    data: {
      paidAt: new Date(),
      ...(order.status === 'pending' ? { status: 'confirmed' } : {}),
    },
  })
}
