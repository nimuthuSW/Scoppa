import { auth } from './auth'
import { notFound } from 'next/navigation'

// Admin pages 404 for everyone else so they aren't discoverable.
export async function requireAdminPage() {
  const session = await auth()
  if (session?.user?.role !== 'admin') notFound()
  return session
}
