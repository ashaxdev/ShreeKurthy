'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { FiEye, FiFilter, FiDownload } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Order {
  _id: string; orderNumber: string; total: number; status: string; paymentStatus: string
  paymentMethod: string; user: { name: string; email: string }; createdAt: string
  items: { quantity: number }[]
}

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700', returned: 'bg-red-100 text-red-700',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchOrders = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/orders?${params}`, { credentials: 'include' }).then(r => r.json())
    if (res.success) { setOrders(res.data); setTotal(res.pagination.total) }
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [statusFilter, page])

  const updateStatus = async (orderId: string, status: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify({ status }),
    }).then(r => r.json())
    if (res.success) { toast.success('Status updated'); fetchOrders() }
    else toast.error(res.message)
  }

  const exportCSV = () => {
    const headers = ['Order Number', 'Customer', 'Email', 'Status', 'Payment', 'Total', 'Date']
    const rows = orders.map(o => [o.orderNumber, o.user?.name, o.user?.email, o.status, o.paymentStatus, o.total, new Date(o.createdAt).toLocaleDateString()])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `orders-${Date.now()}.csv`; a.click()
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{total} orders total</p>
        </div>
        <button onClick={exportCSV} className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg py-2 px-4 text-sm flex items-center gap-2 transition-colors">
          <FiDownload size={14} /> Export CSV
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          <FiFilter size={16} className="text-gray-400 flex-shrink-0" />
          <button onClick={() => setStatusFilter('')} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${!statusFilter ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs capitalize whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{s}</button>
          ))}
        </div>

        {loading ? <p className="text-gray-500 text-center py-8">Loading...</p> : orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left border-b border-gray-200">
                  <th className="pb-3 font-medium">Order #</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Items</th>
                  <th className="pb-3 font-medium">Payment</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-gray-900 font-medium">{order.orderNumber}</td>
                    <td className="py-3 text-gray-700">{order.user?.name}</td>
                    <td className="py-3 text-gray-700">{order.items?.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.paymentMethod} • {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <select value={order.status} onChange={e => updateStatus(order._id, e.target.value)}
                        className="bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500">
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3 text-gray-900 font-medium">₹{order.total.toLocaleString()}</td>
                    <td className="py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 text-right">
                      <Link href={`/admin/orders/${order._id}`} className="text-gray-400 hover:text-red-600 p-1.5 inline-block"><FiEye size={16} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 20 && (
          <div className="flex justify-center gap-2 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-200 transition-colors">Previous</button>
            <span className="px-4 py-2 text-gray-700 text-sm">Page {page} of {Math.ceil(total / 20)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)} className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-200 transition-colors">Next</button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}