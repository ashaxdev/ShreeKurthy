'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ShopLayout from '@/components/layout/ShopLayout'
import { FiPackage } from 'react-icons/fi'

interface Order { _id: string; orderNumber: string; total: number; status: string; createdAt: string; items: { quantity: number }[] }

const statusColors: Record<string, string> = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'badge-purple', delivered: 'badge-success', cancelled: 'badge-error', returned: 'badge-error',
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders?limit=50', { credentials: 'include' }).then(r => r.json()).then(d => {
      if (d.success) setOrders(d.data)
      else router.push('/login')
    }).finally(() => setLoading(false))
  }, [router])

  return (
    <ShopLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>

        {loading ? (
          <p className="text-gray-500 text-center py-12">Loading...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <FiPackage size={64} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">No orders yet</p>
            <Link href="/shop/products" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link key={order._id} href={`/shop/orders/${order._id}`}
                className="block bg-white border border-gray-100 p-4 rounded-sm hover:border-brand-red transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{order.orderNumber}</p>
                  <span className={`badge ${statusColors[order.status]}`}>{order.status}</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                <p className="font-bold text-brand-red mt-2">₹{order.total.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ShopLayout>
  )
}
