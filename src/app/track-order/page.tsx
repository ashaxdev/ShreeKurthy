'use client'
import { useState } from 'react'
import Link from 'next/link'
import ShopLayout from '@/components/layout/ShopLayout'
import { FiSearch, FiPackage, FiPhone } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface OrderItem { name: string; quantity: number }
interface TrackedOrder {
  _id: string; orderNumber: string; status: string; paymentStatus: string; paymentMethod: string
  total: number; items: OrderItem[]; trackingNumber?: string; courierName?: string
  createdAt: string; estimatedDelivery?: string; deliveredAt?: string
  shippingAddress: { name: string; city: string }
}

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
const statusColors: Record<string, string> = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'badge-purple', delivered: 'badge-success', cancelled: 'badge-error', returned: 'badge-error',
}

export default function TrackOrderPage() {
  const [phone, setPhone] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(phone)) { toast.error('Enter a valid 10-digit phone number'); return }

    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, orderNumber: orderNumber || undefined }),
      }).then(r => r.json())

      if (res.success) setOrders(res.data)
      else { setOrders([]); toast.error(res.message) }
    } catch { toast.error('Failed to fetch orders') }
    finally { setLoading(false) }
  }

  return (
    <ShopLayout>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <FiPackage size={48} className="text-brand-red mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-brand-dark">Track Your Order</h1>
          <p className="text-gray-500 mt-2">Enter the phone number used at checkout to view your orders</p>
        </div>

        <form onSubmit={handleSearch} className="bg-brand-cream p-6 rounded-sm border border-gray-100 mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number *</label>
              <div className="relative">
                <FiPhone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number" className="input-field pl-9" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Order Number (optional)</label>
              <input value={orderNumber} onChange={e => setOrderNumber(e.target.value)}
                placeholder="SSRK-XXXXXX" className="input-field" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            <FiSearch size={16} /> {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {searched && orders && orders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders found for this phone number. Please check the number and try again.
          </div>
        )}

        {orders && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map(order => {
              const statusIdx = STATUS_STEPS.indexOf(order.status)
              return (
                <Link key={order._id} href={`/shop/orders/${order._id}`}
                  className="block bg-white border border-gray-100 p-5 rounded-sm hover:border-brand-red transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <span className={`badge ${statusColors[order.status]}`}>{order.status}</span>
                  </div>

                  {order.status !== 'cancelled' && (
                    <div className="flex items-center justify-between relative my-4 px-2">
                      <div className="absolute top-3 left-2 right-2 h-0.5 bg-gray-200" />
                      <div className="absolute top-3 left-2 h-0.5 bg-brand-red transition-all" style={{ width: `${(statusIdx / (STATUS_STEPS.length - 1)) * 96}%` }} />
                      {STATUS_STEPS.map((s, i) => (
                        <div key={s} className="relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{ background: i <= statusIdx ? '#8B1A1A' : '#e5e7eb', color: i <= statusIdx ? '#fff' : '#9ca3af' }}>
                          {i <= statusIdx ? '✓' : i + 1}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-gray-600">{order.items.length} item(s) • ₹{order.total.toLocaleString()}</p>
                  {order.trackingNumber && <p className="text-xs text-brand-gold mt-1">Tracking: {order.trackingNumber} via {order.courierName}</p>}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </ShopLayout>
  )
}
