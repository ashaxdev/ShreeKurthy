'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import AdminLayout from '@/components/admin/AdminLayout'
import toast from 'react-hot-toast'
import { FiSave, FiDownload } from 'react-icons/fi'

interface OrderItem { name: string; image: string; colorName: string; size: string; price: number; quantity: number }
interface Order {
  _id: string; orderNumber: string; items: OrderItem[]; status: string; paymentStatus: string
  paymentMethod: string; subtotal: number; couponDiscount: number; shippingCharge: number; total: number
  shippingAddress: { name: string; phone: string; street: string; city: string; state: string; pincode: string }
  user: { name: string; email: string; phone?: string }
  trackingNumber?: string; courierName?: string; courierBill?: string; createdAt: string
}

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ status: '', trackingNumber: '', courierName: '', courierBill: '', paymentStatus: '' })

  const fetchOrder = async () => {
    const res = await fetch(`/api/orders/${id}`, { credentials: 'include' }).then(r => r.json())
    if (res.success) {
      setOrder(res.data)
      setForm({
        status: res.data.status, trackingNumber: res.data.trackingNumber || '',
        courierName: res.data.courierName || '', courierBill: res.data.courierBill || '',
        paymentStatus: res.data.paymentStatus,
      })
    }
    setLoading(false)
  }

  useEffect(() => { fetchOrder() }, [id])

  const handleSave = async () => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form),
    }).then(r => r.json())
    if (res.success) { toast.success('Order updated'); fetchOrder() }
    else toast.error(res.message)
  }

  const downloadInvoice = async () => {
    if (!order) return
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    const doc = new jsPDF()
    doc.setFontSize(20); doc.setTextColor(139, 26, 26)
    doc.text('SSRK Trending Collections', 14, 20)
    doc.setFontSize(10); doc.setTextColor(100)
    doc.text('No.20 Vasantham Nagar, Thimmavaram, Chengalpet - 603101', 14, 27)
    doc.setFontSize(14); doc.setTextColor(0)
    doc.text('INVOICE', 170, 20)
    doc.setFontSize(10)
    doc.text(`Order: ${order.orderNumber}`, 140, 27)
    autoTable(doc, {
      startY: 50,
      head: [['Item', 'Color/Size', 'Qty', 'Price', 'Total']],
      body: order.items.map(item => [item.name, `${item.colorName}/${item.size}`, item.quantity, `₹${item.price}`, `₹${item.price * item.quantity}`]),
      headStyles: { fillColor: [139, 26, 26] },
    })
    doc.save(`Invoice-${order.orderNumber}.pdf`)
  }

  if (loading) return <AdminLayout><p className="text-gray-700">Loading...</p></AdminLayout>
  if (!order) return <AdminLayout><p className="text-gray-700">Order not found</p></AdminLayout>

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
        </div>
        <button onClick={downloadInvoice} className="border border-red-600 text-red-600 hover:bg-red-50 rounded-lg py-2 px-4 text-sm flex items-center gap-2 transition-colors">
          <FiDownload size={14} /> Invoice
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-gray-900 font-semibold mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3 items-center border-b border-gray-100 pb-3">
                  <div className="relative w-14 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm">{item.name}</p>
                    <p className="text-gray-500 text-xs">{item.colorName} / {item.size} × {item.quantity}</p>
                  </div>
                  <p className="text-gray-900 font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-1 text-sm">
              <div className="flex justify-between text-gray-700"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
              {order.couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.couponDiscount}</span></div>}
              <div className="flex justify-between text-gray-700"><span>Shipping</span><span>₹{order.shippingCharge}</span></div>
              <div className="flex justify-between text-gray-900 font-bold"><span>Total</span><span>₹{order.total}</span></div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-gray-900 font-semibold mb-4">Shipping & Tracking</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 text-sm mb-1">Order Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Payment Status</label>
                <select value={form.paymentStatus} onChange={e => setForm(p => ({ ...p, paymentStatus: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500">
                  {['pending', 'paid', 'failed', 'refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Courier Name</label>
                <input value={form.courierName} onChange={e => setForm(p => ({ ...p, courierName: e.target.value }))} placeholder="e.g. Delhivery, BlueDart"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500" />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Tracking Number</label>
                <input value={form.trackingNumber} onChange={e => setForm(p => ({ ...p, trackingNumber: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-600 text-sm mb-1">Courier Bill / AWB URL</label>
                <input value={form.courierBill} onChange={e => setForm(p => ({ ...p, courierBill: e.target.value }))} placeholder="Link to courier bill"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500" />
              </div>
            </div>
            <button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white rounded-lg mt-4 px-4 py-2.5 text-sm font-medium flex items-center gap-2 transition-colors">
              <FiSave size={14} /> Save Changes
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-gray-900 font-semibold mb-4">Customer</h2>
            <p className="text-gray-900 text-sm">{order.user?.name}</p>
            <p className="text-gray-500 text-sm">{order.user?.email}</p>
            <p className="text-gray-500 text-sm">{order.user?.phone}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-gray-900 font-semibold mb-4">Shipping Address</h2>
            <p className="text-gray-900 text-sm">{order.shippingAddress.name}</p>
            <p className="text-gray-700 text-sm">{order.shippingAddress.street}</p>
            <p className="text-gray-700 text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p className="text-gray-700 text-sm mt-1">📞 {order.shippingAddress.phone}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}