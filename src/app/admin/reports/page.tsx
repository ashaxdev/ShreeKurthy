'use client'
import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { FiDownload, FiCalendar } from 'react-icons/fi'

interface OrderRow { orderNumber: string; user: { name: string; email: string }; total: number; status: string; createdAt: string; items: { quantity: number }[] }
interface SalesData { orders: OrderRow[]; summary: { totalRevenue: number; totalOrders: number; totalItems: number; avgOrderValue: number } }

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  const [data, setData] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const fetchReport = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ type: 'sales', period })
    if (customStart) params.set('startDate', customStart)
    if (customEnd) params.set('endDate', customEnd)
    const res = await fetch(`/api/reports?${params}`, { credentials: 'include' }).then(r => r.json())
    if (res.success) setData(res.data)
    setLoading(false)
  }, [period, customStart, customEnd])

  useEffect(() => { fetchReport() }, [fetchReport])

  const exportCSV = () => {
    if (!data) return
    const headers = ['Order Number', 'Customer', 'Email', 'Status', 'Items', 'Total', 'Date']
    const rows = data.orders.map(o => [o.orderNumber, o.user?.name, o.user?.email, o.status, o.items.reduce((s, i) => s + i.quantity, 0), o.total, new Date(o.createdAt).toLocaleDateString()])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `sales-report-${period}-${Date.now()}.csv`; a.click()
  }

  const exportExcel = async () => {
    if (!data) return
    const XLSX = await import('xlsx')
    const wsData = data.orders.map(o => ({
      'Order Number': o.orderNumber, 'Customer': o.user?.name, 'Email': o.user?.email,
      'Status': o.status, 'Items': o.items.reduce((s, i) => s + i.quantity, 0),
      'Total (₹)': o.total, 'Date': new Date(o.createdAt).toLocaleDateString(),
    }))
    const ws = XLSX.utils.json_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report')
    XLSX.writeFile(wb, `sales-report-${period}-${Date.now()}.xlsx`)
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 border-brand-gold text-brand-gold">
            <FiDownload size={14} /> CSV
          </button>
          <button onClick={exportExcel} className="btn-gold py-2 px-4 text-sm flex items-center gap-2">
            <FiDownload size={14} /> Excel
          </button>
        </div>
      </div>

      <div className="admin-card mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {[['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly']].map(([key, label]) => (
            <button key={key} onClick={() => { setPeriod(key as 'daily' | 'weekly' | 'monthly'); setCustomStart(''); setCustomEnd('') }}
              className={`px-4 py-2 rounded-lg text-sm ${period === key && !customStart ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-600'}`}>{label}</button>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <FiCalendar size={14} className="text-gray-400" />
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-xs" />
            <span className="text-gray-500 text-xs">to</span>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-xs" />
          </div>
        </div>
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="stats-card"><div><p className="text-gray-500 text-xs">Total Revenue</p><p className="text-gray-900 text-xl font-bold">₹{data.summary.totalRevenue.toLocaleString()}</p></div></div>
            <div className="stats-card"><div><p className="text-gray-500 text-xs">Total Orders</p><p className="text-gray-900 text-xl font-bold">{data.summary.totalOrders}</p></div></div>
            <div className="stats-card"><div><p className="text-gray-500 text-xs">Items Sold</p><p className="text-gray-900 text-xl font-bold">{data.summary.totalItems}</p></div></div>
            <div className="stats-card"><div><p className="text-gray-500 text-xs">Avg Order Value</p><p className="text-gray-900 text-xl font-bold">₹{data.summary.avgOrderValue.toLocaleString()}</p></div></div>
          </div>

          <div className="admin-card">
            <h2 className="text-gray-900 font-semibold mb-4">Orders ({data.orders.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-left border-b border-gray-200">
                    <th className="pb-3 font-medium">Order #</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((o, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-3 text-gray-900">{o.orderNumber}</td>
                      <td className="py-3 text-gray-600">{o.user?.name}</td>
                      <td className="py-3"><span className="badge badge-info">{o.status}</span></td>
                      <td className="py-3 text-gray-900">₹{o.total.toLocaleString()}</td>
                      <td className="py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}