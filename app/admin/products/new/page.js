import { requireAdminPage, getCategories } from '@/lib/admin'
import ProductForm from '../../ProductForm'

export const metadata = { title: 'New product — sċoppa admin' }

export default async function NewProductPage({ searchParams }) {
  await requireAdminPage()
  const [{ error }, categories] = await Promise.all([searchParams, getCategories()])
  return <ProductForm categories={categories} error={error} />
}
