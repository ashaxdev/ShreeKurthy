'use client'
import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ShopLayout from '@/components/layout/ShopLayout'
import { FiCheckCircle, FiDownload, FiTruck, FiPackage, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface OrderItem { name: string; image: string; colorName: string; size: string; price: number; quantity: number }
interface Order {
  _id: string; orderNumber: string; items: OrderItem[]; status: string; paymentStatus: string
  paymentMethod: string; subtotal: number; couponDiscount: number; shippingCharge: number; total: number
  shippingAddress: { name: string; phone: string; street: string; city: string; state: string; pincode: string }
  trackingNumber?: string; courierName?: string; createdAt: string; estimatedDelivery?: string
}

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

function OrderDetailContent() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const isSuccess = searchParams.get('success') === 'true'
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/orders/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setOrder(d.data) })
      .finally(() => setLoading(false))
  }, [id])

  const downloadInvoice = async () => {
    if (!order) return
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.setTextColor(139, 26, 26)
    doc.text('SSRK Trending Collections', 14, 20)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text('No.20 Vasantham Nagar, Thimmavaram, Chengalpet - 603101', 14, 27)
    doc.text('Phone: 9994333728 / 9171070722 | Email: ss@ssrkcollections.com', 14, 32)

    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text('INVOICE', 170, 20)
    doc.setFontSize(10)
    doc.text(`Order: ${order.orderNumber}`, 140, 27)
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 140, 32)

    doc.setFontSize(11)
    doc.text('Bill To:', 14, 45)
    doc.setFontSize(10)
    doc.text(order.shippingAddress.name, 14, 51)
    doc.text(order.shippingAddress.street, 14, 56)
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`, 14, 61)
    doc.text(`Phone: ${order.shippingAddress.phone}`, 14, 66)

    autoTable(doc, {
      startY: 75,
      head: [['Item', 'Color/Size', 'Qty', 'Price', 'Total']],
      body: order.items.map(item => [
        item.name, `${item.colorName} / ${item.size}`, item.quantity,
        `₹${item.price}`, `₹${item.price * item.quantity}`
      ]),
      headStyles: { fillColor: [139, 26, 26] },
    })

    // @ts-expect-error - autoTable adds this property
    const finalY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.text(`Subtotal: ₹${order.subtotal}`, 140, finalY)
    if (order.couponDiscount > 0) doc.text(`Discount: -₹${order.couponDiscount}`, 140, finalY + 5)
    doc.text(`Shipping: ₹${order.shippingCharge}`, 140, finalY + 10)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Total: ₹${order.total}`, 140, finalY + 18)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150)
    doc.text('Thank you for shopping with SSRK Trending Collections!', 14, finalY + 30)

    doc.save(`Invoice-${order.orderNumber}.pdf`)
    toast.success('Invoice downloaded')
  }

  if (loading) return <ShopLayout><div className="text-center py-20">Loading...</div></ShopLayout>
  if (!order) return <ShopLayout><div className="text-center py-20">Order not found</div></ShopLayout>

  const statusIdx = STATUS_STEPS.indexOf(order.status)

  return (
    <ShopLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-sm p-6 mb-8 text-center">
            <FiCheckCircle size={48} className="text-green-500 mx-auto mb-3" />
            <h2 className="font-display text-xl font-bold text-green-800">Order Placed Successfully!</h2>
            <p className="text-green-600 text-sm mt-1">We'll send you updates about your order</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">Order {order.orderNumber}</h1>
            <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <button onClick={downloadInvoice} className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
            <FiDownload size={14} /> Invoice
          </button>
        </div>

        {/* Status Tracker */}
        {order.status !== 'cancelled' ? (
          <div className="bg-white border border-gray-100 p-6 rounded-sm mb-6">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />
              <div className="absolute top-4 left-0 h-0.5 bg-brand-red transition-all" style={{ width: `${(statusIdx / (STATUS_STEPS.length - 1)) * 100}%` }} />
              {STATUS_STEPS.map((s, i) => (
                <div key={s} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= statusIdx ? 'bg-brand-red text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {i <= statusIdx ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs capitalize ${i <= statusIdx ? 'text-brand-red font-medium' : 'text-gray-400'}`}>{s}</span>
                </div>
              ))}
            </div>
            {order.trackingNumber && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm">
                <FiTruck className="text-brand-gold" />
                <span>Tracking: <strong>{order.trackingNumber}</strong> via {order.courierName}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 p-4 rounded-sm mb-6 flex items-center gap-2 text-red-700">
            <FiX /> This order has been cancelled
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-4 bg-white border border-gray-100 p-4 rounded-sm">
                <div className="relative w-20 h-24 bg-gray-50 flex-shrink-0">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.colorName} / {item.size} • Qty: {item.quantity}</p>
                  <p className="font-bold text-brand-red mt-2">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="bg-brand-cream p-4 rounded-sm">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><FiPackage size={14} /> Delivery Address</h3>
              <p className="text-sm font-medium">{order.shippingAddress.name}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress.street}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p className="text-sm text-gray-600 mt-1">📞 {order.shippingAddress.phone}</p>
            </div>

            <div className="bg-white border border-gray-100 p-4 rounded-sm">
              <h3 className="font-semibold text-sm mb-3">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{order.subtotal}</span></div>
                {order.couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.couponDiscount}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span></div>
                <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span className="text-brand-red">₹{order.total}</span></div>
              </div>
              <p className="text-xs text-gray-400 mt-3 capitalize">Payment: {order.paymentMethod} ({order.paymentStatus})</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/shop/products" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    </ShopLayout>
  )
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<ShopLayout><div className="text-center py-20">Loading...</div></ShopLayout>}>
      <OrderDetailContent />
    </Suspense>
  )
}
