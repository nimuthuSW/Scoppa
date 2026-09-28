import { prisma } from '@/lib/prisma'

// Serves admin-uploaded product images. Uploads are never modified (a new
// upload gets a new id), so they can be cached forever.
export async function GET(request, { params }) {
  const { id } = await params

  const upload = await prisma.upload.findUnique({ where: { id } })
  if (!upload) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(upload.data, {
    headers: {
      'Content-Type': upload.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
