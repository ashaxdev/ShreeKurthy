'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { FiSearch, FiPhone, FiMail } from 'react-icons/fi'

interface Customer { _id: string; name: string; email: string; phone?: string; createdAt: string; orderCount: number; totalSpent: number }

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams({ limit: '50' })
    if (search) params.set('search', search)
    setLoading(true)
    fetch(`/api/users?${params}`, { credentials: 'include' }).then(r => r.json()).then(d => {
      if (d.success) { setCustomers(d.data); setTotal(d.pagination.total) }
    }).finally(() => setLoading(false))
  }, [search])

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">{total} registered customers</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="relative mb-6">
          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, email or phone..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500" />
        </div>

        {loading ? <p className="text-gray-500 text-center py-8">Loading...</p> : customers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No customers found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left border-b border-gray-200">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Contact</th>
                  <th className="pb-3 font-medium">Orders</th>
                  <th className="pb-3 font-medium">Total Spent</th>
                  <th className="pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-gray-900 font-medium">{c.name}</td>
                    <td className="py-3">
                      <p className="text-gray-700 text-xs flex items-center gap-1"><FiMail size={11} /> {c.email}</p>
                      {c.phone && <p className="text-gray-700 text-xs flex items-center gap-1 mt-0.5"><FiPhone size={11} /> {c.phone}</p>}
                    </td>
                    <td className="py-3 text-gray-700">{c.orderCount}</td>
                    <td className="py-3 text-gray-900 font-medium">₹{c.totalSpent.toLocaleString()}</td>
                    <td className="py-3 text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}