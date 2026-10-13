'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ORDER_STATUSES } from '@/app/components/OrderStatusBadge'
import { detectImageType, MAX_UPLOAD_BYTES, UPLOAD_PATH_PREFIX, uploadIdFromImage } from '@/lib/uploads'
import { NEW_CATEGORY } from '@/lib/categories'
import { cancelOrderAndRestock, markOrderPaid } from '@/lib/orders'

function backWithError(path, message) {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

export async function saveProduct(formData) {
  await requireAdmin()

  const id = formData.get('id')?.toString() || null
  const name = formData.get('name')?.toString().trim() ?? ''
  const description = formData.get('description')?.toString().trim() ?? ''
  const categoryChoice = formData.get('category')?.toString().trim() ?? ''
  const category =
    (categoryChoice === NEW_CATEGORY
      ? formData.get('newCategory')?.toString().trim()
      : categoryChoice) || 'Uncategorized'
  const imageUrl = formData.get('image')?.toString().trim() || null
  const imageFile = formData.get('imageFile')
  const hasFile = typeof imageFile === 'object' && imageFile !== null && imageFile.size > 0
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
  if (category.length > 50) {
    backWithError(formPath, 'Category must be 50 characters or fewer.')
  }

  let upload = null
  if (hasFile) {
    if (imageFile.size > MAX_UPLOAD_BYTES) {
      backWithError(formPath, 'Image must be 2 MB or smaller.')
    }
    const bytes = new Uint8Array(await imageFile.arrayBuffer())
    const contentType = detectImageType(bytes)
    if (!contentType) {
      backWithError(formPath, 'Image must be a JPEG, PNG, WebP, GIF or AVIF file.')
    }
    upload = { data: bytes, contentType }
  } else if (imageUrl && !/^https:\/\//.test(imageUrl) && !uploadIdFromImage(imageUrl)) {
    backWithError(formPath, 'Image must be an https:// URL.')
  }

  const existing = id
    ? await prisma.product.findUnique({ where: { id }, select: { image: true } })
    : null
  if (id && !existing) {
    backWithError('/admin', 'That product no longer exists.')
  }

  await prisma.$transaction(async tx => {
    let image = imageUrl
    if (upload) {
      const created = await tx.upload.create({ data: upload, select: { id: true } })
      image = `${UPLOAD_PATH_PREFIX}${created.id}`
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
      await tx.product.update({ where: { id }, data })
    } else {
      await tx.product.create({ data })
    }

    // Drop the previous upload once nothing points at it.
    await deleteUploadIfUnused(tx, existing?.image)
  })

  revalidatePath('/products')
  revalidatePath('/admin')
  redirect('/admin')
}

export async function deleteProduct(formData) {
  await requireAdmin()

  const id = formData.get('id')?.toString()
  if (!id) redirect('/admin')

  try {
    const product = await prisma.product.delete({ where: { id } })
    await deleteUploadIfUnused(prisma, product.image)
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

async function deleteUploadIfUnused(db, image) {
  const uploadId = uploadIdFromImage(image)
  if (!uploadId) return

  const stillUsed = await db.product.count({ where: { image } })
  if (stillUsed === 0) {
    await db.upload.deleteMany({ where: { id: uploadId } })
  }
}

export async function updateOrderStatus(formData) {
  await requireAdmin()

  const id = formData.get('id')?.toString()
  const status = formData.get('status')?.toString()
  if (!id || !ORDER_STATUSES.includes(status)) redirect('/admin/orders')

  const order = await prisma.order.findUnique({ where: { id }, select: { status: true } })
  if (!order) backWithError('/admin/orders', 'That order no longer exists.')

  if (order.status !== status) {
    // Cancelling returns the items to stock, so a cancelled order is final.
    if (order.status === 'cancelled') {
      backWithError('/admin/orders', 'Cancelled orders can\'t be reopened — ask the customer to order again.')
    }
    if (status === 'cancelled') {
      await cancelOrderAndRestock(id)
      revalidatePath('/products')
      revalidatePath('/admin')
    } else {
      await prisma.order.update({ where: { id }, data: { status } })
    }
  }

  revalidatePath('/admin/orders')
  revalidatePath('/orders')
  redirect('/admin/orders')
}

// Bank transfer received, or cash collected on delivery.
export async function markPaid(formData) {
  await requireAdmin()

  const id = formData.get('id')?.toString()
  if (id) await markOrderPaid(id)

  revalidatePath('/admin/orders')
  revalidatePath('/orders')
  redirect('/admin/orders')
}

export async function setUserRole(formData) {
  const session = await requireAdmin()

  const id = formData.get('id')?.toString()
  const role = formData.get('role')?.toString()

  if (!id || !['admin', 'customer'].includes(role)) {
    backWithError('/admin/users', 'Invalid request.')
  }
  // Guards against locking yourself (and possibly everyone) out.
  if (id === session.user.id) {
    backWithError('/admin/users', 'You can\'t change your own role.')
  }

  await prisma.user.updateMany({ where: { id }, data: { role } })

  revalidatePath('/admin/users')
  redirect('/admin/users')
}
