import { connection } from 'next/server'
import { getEnabledPaymentMethods } from '@/lib/payment-config'
import CheckoutForm from './CheckoutForm'

export const metadata = { title: 'Checkout — sċoppa' }

export default async function CheckoutPage() {
  // Payment methods come from env vars, so read them per request rather
  // than baking them in at build time.
  await connection()
  return <CheckoutForm paymentMethods={getEnabledPaymentMethods()} />
}
