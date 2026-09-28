import { auth } from './auth'
import { prisma } from './prisma'
import { notFound } from 'next/navigation'

// The role in the session token is only refreshed at login, so admin checks
// read it from the database — a demoted admin loses access immediately.
async function currentAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  return user?.role === 'admin' ? session : null
}

// Admin pages 404 for everyone else so they aren't discoverable.
export async function requireAdminPage() {
  const session = await currentAdmin()
  if (!session) notFound()
  return session
}

// For server actions.
export async function requireAdmin() {
  const session = await currentAdmin()
  if (!session) throw new Error('Unauthorized')
  return session
}

// Existing product categories, for the product form's dropdown.
export async function getCategories() {
  const groups = await prisma.product.groupBy({
    by: ['category'],
    orderBy: { category: 'asc' },
  })
  return groups.map(g => g.category)
}
