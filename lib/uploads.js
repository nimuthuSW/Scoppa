// Product images uploaded through the admin panel live in the Upload table
// and are referenced from Product.image as `/api/images/<id>`.
export const UPLOAD_PATH_PREFIX = '/api/images/'
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024

export function uploadIdFromImage(image) {
  if (typeof image !== 'string' || !image.startsWith(UPLOAD_PATH_PREFIX)) return null
  const id = image.slice(UPLOAD_PATH_PREFIX.length)
  return /^[a-z0-9]+$/i.test(id) ? id : null
}

// Detects the image type from the file's magic bytes rather than trusting
// the browser-supplied type. SVG is deliberately unsupported (it can carry
// scripts).
export function detectImageType(bytes) {
  const starts = (sig, offset = 0) => sig.every((b, i) => bytes[offset + i] === b)
  const ascii = (str, offset) => starts([...str].map(c => c.charCodeAt(0)), offset)

  if (starts([0xff, 0xd8, 0xff])) return 'image/jpeg'
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png'
  if (ascii('GIF87a', 0) || ascii('GIF89a', 0)) return 'image/gif'
  if (ascii('RIFF', 0) && ascii('WEBP', 8)) return 'image/webp'
  if (ascii('ftypavif', 4)) return 'image/avif'
  return null
}
