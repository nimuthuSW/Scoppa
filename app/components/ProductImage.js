import Image from 'next/image'

// Hosts allowed through the Next.js image optimizer (must match
// images.remotePatterns in next.config.mjs). Anything else renders
// unoptimized so admin-added image URLs never crash the page.
const OPTIMIZED_HOSTS = new Set(['images.unsplash.com'])

function canOptimize(src) {
  try {
    return OPTIMIZED_HOSTS.has(new URL(src).hostname)
  } catch {
    return false
  }
}

// Renders a product image inside a positioned wrapper (pass sizing via
// className). Falls back to a placeholder when the product has no image.
export default function ProductImage({ src, alt, sizes, className = '', imageClassName = '' }) {
  if (!src) {
    return (
      <div className={`relative overflow-hidden bg-slate-100 flex items-center justify-center ${className}`}>
        <span className="text-3xl opacity-40" aria-hidden="true">🛍️</span>
        <span className="sr-only">{alt}</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={`object-cover ${imageClassName}`}
        unoptimized={!canOptimize(src)}
      />
    </div>
  )
}
