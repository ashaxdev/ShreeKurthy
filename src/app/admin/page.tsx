'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'
import { FiDollarSign, FiShoppingBag, FiUsers, FiBox, FiTrendingUp } from 'react-icons/fi'

interface DashboardData {
  summary: { totalRevenue: number; totalOrders: number; totalUsers: number; totalProducts: number }
  recentOrders: { _id: string; orderNumber: string; total: number; status: string; user: { name: string }; createdAt: string }[]
  topProducts: { product: { name: string; images: string[] }; totalSold: number; revenue: number }[]
  chartData: { date: string; revenue: number; orders: number }[]
  ordersByStatus: { _id: string; count: number }[]
}

const COLORS = ['#8B1A1A', '#C9A84C', '#1B5E20', '#B22222', '#E8C97E', '#5C0000']

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports?type=dashboard', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminLayout><div className="text-gray-600">Loading dashboard...</div></AdminLayout>
  if (!data) return <AdminLayout><div className="text-gray-600">Failed to load data</div></AdminLayout>

  const statusColors: Record<string, string> = {
    pending: '#B8860B', confirmed: '#2563eb', processing: '#7c3aed',
    shipped: '#0891b2', delivered: '#059669', cancelled: '#dc2626', returned: '#ea580c',
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: `₹${data.summary.totalRevenue.toLocaleString()}`, icon: FiDollarSign, color: '#059669' },
          { label: 'Total Orders', value: data.summary.totalOrders, icon: FiShoppingBag, color: '#2563eb' },
          { label: 'Total Customers', value: data.summary.totalUsers, icon: FiUsers, color: '#B8860B' },
          { label: 'Active Products', value: data.summary.totalProducts, icon: FiBox, color: '#8B1A1A' },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${stat.color}15` }}>
                <Icon size={22} style={{ color: stat.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-gray-500 text-xs">{stat.label}</p>
                <p className="text-gray-900 text-xl font-bold truncate">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900 font-semibold flex items-center gap-2"><FiTrendingUp /> Revenue (Last 30 Days)</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 11 }} interval={4} />
            <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8 }} labelStyle={{ color: '#111827' }} />
            <Line type="monotone" dataKey="revenue" stroke="#B8860B" strokeWidth={2} dot={false} name="Revenue (₹)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Orders by Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-gray-900 font-semibold mb-6">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.ordersByStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={(entry) => `${entry._id}: ${entry.count}`}>
                {data.ordersByStatus.map((entry, i) => (
                  <Cell key={i} fill={statusColors[entry._id] || COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-gray-900 font-semibold mb-6">Top Selling Products</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.topProducts.map(p => ({ name: p.product?.name?.slice(0, 15) || 'N/A', sold: p.totalSold }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" stroke="#6B7280" tick={{ fontSize: 11 }} width={100} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8 }} />
              <Bar dataKey="sold" fill="#8B1A1A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900 font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-amber-700 text-sm hover:underline">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-left border-b border-gray-200">
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map(order => (
                <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">
                    <Link href={`/admin/orders/${order._id}`} className="text-gray-900 hover:text-amber-700">{order.orderNumber}</Link>
                  </td>
                  <td className="py-3 text-gray-700">{order.user?.name || 'Guest'}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: `${statusColors[order.status]}15`, color: statusColors[order.status] }}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-right text-gray-900 font-medium">₹{order.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}