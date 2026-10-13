'use client'

import { useEffect, useRef, useState } from 'react'
import ProductImage from '@/app/components/ProductImage'

const MAX_BYTES = 2 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif'

// Upload an image file, or paste an https:// URL. An uploaded file wins.
export default function ImageField({ defaultValue, inputClass }) {
  const fileRef = useRef(null)
  const [url, setUrl] = useState(defaultValue ?? '')
  const [filePreview, setFilePreview] = useState(null)
  const [fileError, setFileError] = useState(null)

  useEffect(() => () => filePreview && URL.revokeObjectURL(filePreview), [filePreview])

  function handleFile(e) {
    const file = e.target.files?.[0]
    setFileError(null)
    setFilePreview(null)
    if (!file) return
    if (file.size > MAX_BYTES) {
      setFileError('Image must be 2 MB or smaller.')
      e.target.value = ''
      return
    }
    setFilePreview(URL.createObjectURL(file))
  }

  function clearImage() {
    if (fileRef.current) fileRef.current.value = ''
    setFilePreview(null)
    setFileError(null)
    setUrl('')
  }

  const previewSrc = filePreview ?? (/^(https:\/\/|\/api\/images\/)/.test(url) ? url : null)

  return (
    <div className="flex gap-4 items-start">
      <ProductImage
        src={previewSrc}
        alt="Product image preview"
        sizes="96px"
        className="w-24 h-24 rounded-xl flex-shrink-0 border border-slate-100"
      />
      <div className="flex-1 min-w-0 space-y-2">
        <input
          ref={fileRef}
          type="file"
          name="imageFile"
          accept={ACCEPT}
          onChange={handleFile}
          aria-label="Upload image"
          className="block w-full text-sm text-slate-500 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-medium hover:file:bg-indigo-100 file:cursor-pointer"
        />
        <p className="text-xs text-slate-400">JPEG, PNG, WebP, GIF or AVIF, up to 2 MB.</p>
        {fileError && <p className="text-xs text-red-500">{fileError}</p>}
        <input
          type="text"
          name="image"
          value={url}
          onChange={e => setUrl(e.target.value)}
          disabled={Boolean(filePreview)}
          placeholder="…or paste an https:// image URL"
          aria-label="Image URL"
          className={`${inputClass} disabled:opacity-50`}
        />
        {(url || filePreview) && (
          <button
            type="button"
            onClick={clearImage}
            className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            Remove image
          </button>
        )}
      </div>
    </div>
  )
}
