import Stripe from 'stripe'

// Card payments are optional: without STRIPE_SECRET_KEY the store runs with
// bank transfer and cash on delivery only.
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null
