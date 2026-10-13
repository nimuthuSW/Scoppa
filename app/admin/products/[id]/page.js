import { prisma } from '@/lib/prisma'
import { requireAdminPage, getCategories } from '@/lib/admin'
import { notFound } from 'next/navigation'
import ProductForm from '../../ProductForm'

export const metadata = { title: 'Edit product — sċoppa admin' }

export default async function EditProductPage({ params, searchParams }) {
  await requireAdminPage()
  const { id } = await params
  const { error } = await searchParams

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    getCategories(),
  ])
  if (!product) notFound()

  return <ProductForm product={product} categories={categories} error={error} />
}
