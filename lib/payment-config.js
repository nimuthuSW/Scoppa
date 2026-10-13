// Server-only: which payment methods the store offers, from env vars.
//   card          — when STRIPE_SECRET_KEY is set
//   bank_transfer — when BANK_TRANSFER_DETAILS is set
//   cod           — unless CASH_ON_DELIVERY="false"
export function getEnabledPaymentMethods() {
  const methods = []
  if (process.env.STRIPE_SECRET_KEY) methods.push('card')
  if (getBankTransferDetails()) methods.push('bank_transfer')
  if (process.env.CASH_ON_DELIVERY !== 'false') methods.push('cod')
  return methods
}

// The account details customers transfer to, shown on their order page.
// Multi-line; a literal "\n" also counts as a line break for hosts whose
// env var editors are single-line.
export function getBankTransferDetails() {
  const details = process.env.BANK_TRANSFER_DETAILS?.replaceAll('\\n', '\n').trim()
  return details || null
}
