// Payment method labels, shared by server and client code. Which methods are
// actually offered is decided server-side by getEnabledPaymentMethods()
// in lib/payment-config.js.
export const PAYMENT_METHODS = {
  card: {
    label: 'Card',
    description: 'Pay securely online with Stripe.',
  },
  bank_transfer: {
    label: 'Bank transfer',
    description: 'Transfer the total to our bank account. We ship once it arrives.',
  },
  cod: {
    label: 'Cash on delivery',
    description: 'Pay in cash when your order is delivered.',
  },
}

export function paymentMethodLabel(method) {
  return PAYMENT_METHODS[method]?.label ?? method
}

// Short order number shown to customers and used as the bank transfer
// reference.
export function orderReference(orderId) {
  return orderId.slice(-8).toUpperCase()
}
