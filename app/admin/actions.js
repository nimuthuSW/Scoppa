'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ORDER_STATUSES } from '@/app/components/OrderStatusBadge'

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    throw new Error('Unauthorized')
  }
}

function backWithError(path, message) {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

export async function saveProduct(formData) {
  await requireAdmin()

  const id = formData.get('id')?.toString() || null
  const name = formData.get('name')?.toString().trim() ?? ''
  const description = formData.get('description')?.toString().trim() ?? ''
  const category = formData.get('category')?.toString().trim() || 'Uncategorized'
  const image = formData.get('image')?.toString().trim() || null
  const price = Number.parseFloat(formData.get('price'))
  const stock = Number.parseInt(formData.get('stock'), 10)

  const formPath = id ? `/admin/products/${id}` : '/admin/products/new'
  if (!name || !description) {
    backWithError(formPath, 'Name and description are required.')
  }
  if (!Number.isFinite(price) || price < 0 || price > 1_000_000) {
    backWithError(formPath, 'Price must be a positive number.')
  }
  if (!Number.isInteger(stock) || stock < 0) {
    backWithError(formPath, 'Stock must be a whole number of 0 or more.')
  }
  if (image && !/^https:\/\//.test(image)) {
    backWithError(formPath, 'Image must be an https:// URL.')
  }

  const data = {
    name,
    description,
    category,
    image,
    price: Math.round(price * 100) / 100,
    stock,
  }

  if (id) {
    await prisma.product.update({ where: { id }, data })
  } else {
    await prisma.product.create({ data })
  }

  revalidatePath('/products')
  revalidatePath('/admin')
  redirect('/admin')
}

export async function deleteProduct(formData) {
  await requireAdmin()

  const id = formData.get('id')?.toString()
  if (!id) redirect('/admin')

  try {
    await prisma.product.delete({ where: { id } })
  } catch (err) {
    // Foreign-key restraint: the product appears in past orders.
    if (err?.code === 'P2003') {
      backWithError('/admin', 'This product has orders — set its stock to 0 instead of deleting it.')
    }
    throw err
  }

  revalidatePath('/products')
  revalidatePath('/admin')
  redirect('/admin')
}

export async function updateOrderStatus(formData) {
  await requireAdmin()

  const id = formData.get('id')?.toString()
  const status = formData.get('status')?.toString()

  if (id && ORDER_STATUSES.includes(status)) {
    await prisma.order.update({ where: { id }, data: { status } })
  }

  revalidatePath('/admin/orders')
  revalidatePath('/orders')
  redirect('/admin/orders')
}
