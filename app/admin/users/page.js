import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/admin'
import { setUserRole } from '../actions'
import Link from 'next/link'

export const metadata = { title: 'Users — sċoppa admin' }

export default async function AdminUsersPage({ searchParams }) {
  const session = await requireAdminPage()
  const { error, q } = await searchParams
  const query = typeof q === 'string' ? q.trim() : ''

  const users = await prisma.user.findMany({
    where: query
      ? { OR: [{ name: { contains: query } }, { email: { contains: query } }] }
      : {},
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    // Admins first, then newest customers.
    orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Admins can manage products, orders and other users. Role changes apply immediately.
          </p>
        </div>
        <Link
          href="/admin"
          className="px-5 py-2.5 border border-indigo-100 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150 self-start sm:self-auto"
        >
          ← Products
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <form action="/admin/users" className="flex gap-2 mb-4">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by name or email..."
          aria-label="Search users"
          className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-indigo-200 transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all cursor-pointer"
        >
          Search
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium">Orders</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(user => {
              const isSelf = user.id === session.user.id
              const isAdmin = user.role === 'admin'
              return (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <p className="font-medium text-slate-900">
                      {user.name ?? '—'}
                      {isSelf && <span className="ml-2 text-xs text-slate-400">(you)</span>}
                    </p>
                    <p className="text-slate-400">{user.email}</p>
                  </td>
                  <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{user._count.orders}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        isAdmin ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right whitespace-nowrap">
                    {isSelf ? (
                      <span className="text-slate-300">—</span>
                    ) : (
                      <form action={setUserRole} className="inline">
                        <input type="hidden" name="id" value={user.id} />
                        <input type="hidden" name="role" value={isAdmin ? 'customer' : 'admin'} />
                        <button
                          type="submit"
                          className={`font-semibold transition-colors cursor-pointer ${
                            isAdmin
                              ? 'text-slate-400 hover:text-red-500'
                              : 'text-indigo-600 hover:text-violet-600'
                          }`}
                        >
                          {isAdmin ? 'Remove admin' : 'Make admin'}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center text-slate-400 py-10">
            {query ? <>No users match &ldquo;{query}&rdquo;.</> : 'No users yet.'}
          </p>
        )}
      </div>
    </div>
  )
}
