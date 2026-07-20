import { requireAdminPage } from '@/lib/admin'
import ProductForm from '../../ProductForm'

export const metadata = { title: 'New product — sċoppa admin' }

export default async function NewProductPage({ searchParams }) {
  await requireAdminPage()
  const { error } = await searchParams
  return <ProductForm error={error} />
}
