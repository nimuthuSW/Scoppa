'use client'

import { useState } from 'react'
import { NEW_CATEGORY } from '@/lib/categories'

// Picks from existing categories so names stay consistent, with an escape
// hatch for creating a new one.
export default function CategoryField({ categories, defaultValue, inputClass }) {
  const isExisting = categories.includes(defaultValue)
  const [choice, setChoice] = useState(
    isExisting ? defaultValue : (defaultValue || categories.length === 0) ? NEW_CATEGORY : ''
  )

  return (
    <div className="space-y-2">
      <select
        id="category"
        name="category"
        required
        value={choice}
        onChange={e => setChoice(e.target.value)}
        className={`${inputClass} bg-white`}
      >
        <option value="" disabled>Select a category…</option>
        {categories.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
        <option value={NEW_CATEGORY}>+ New category…</option>
      </select>
      {choice === NEW_CATEGORY && (
        <input
          type="text"
          name="newCategory"
          required
          maxLength={50}
          autoFocus={categories.length > 0}
          defaultValue={isExisting ? '' : defaultValue ?? ''}
          placeholder="New category name"
          aria-label="New category name"
          className={inputClass}
        />
      )}
    </div>
  )
}
