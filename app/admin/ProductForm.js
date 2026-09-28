import { saveProduct } from './actions'
import Link from 'next/link'
import CategoryField from './CategoryField'
import ImageField from './ImageField'

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-indigo-200 transition-colors'

export default function ProductForm({ product = null, categories = [], error = null }) {
  return (
    <div className="max-w-xl animate-fade-in-up">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        {product ? 'Edit Product' : 'New Product'}
      </h1>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <form action={saveProduct} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-5">
        {product && <input type="hidden" name="id" value={product.id} />}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
          <input type="text" name="name" required defaultValue={product?.name ?? ''} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea name="description" required rows={4} defaultValue={product?.description ?? ''} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Price ($)</label>
            <input type="number" name="price" required min="0" step="0.01" defaultValue={product?.price ?? ''} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Stock</label>
            <input type="number" name="stock" required min="0" step="1" defaultValue={product?.stock ?? 0} className={inputClass} />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
          <CategoryField categories={categories} defaultValue={product?.category} inputClass={inputClass} />
        </div>

        <div>
          <span className="block text-sm font-medium text-slate-700 mb-1.5">Image</span>
          <ImageField defaultValue={product?.image} inputClass={inputClass} />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            {product ? 'Save Changes' : 'Create Product'}
          </button>
          <Link
            href="/admin"
            className="px-6 py-3.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:border-indigo-200 hover:text-indigo-600 transition-all duration-150"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
