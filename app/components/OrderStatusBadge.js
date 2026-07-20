export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  shipped: 'bg-sky-50 text-sky-700 border-sky-100',
  delivered: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  cancelled: 'bg-red-50 text-red-600 border-red-100',
}

export default function OrderStatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? 'bg-slate-50 text-slate-600 border-slate-100'
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${style}`}>
      {status}
    </span>
  )
}
