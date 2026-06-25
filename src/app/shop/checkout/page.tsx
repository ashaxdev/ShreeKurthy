'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ShopLayout from '@/components/layout/ShopLayout'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { FiLock, FiCreditCard, FiPackage } from 'react-icons/fi'

declare global { interface Window { Razorpay: new (opts: object) => { open(): void } } }

interface CartItem { key: string; _id: string; name: string; price: number; mrp: number; image: string; quantity: number; colorName: string; colorHex: string; size: string; sku?: string }
interface Address { name: string; phone: string; street: string; city: string; state: string; pincode: string }

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [step, setStep] = useState<'address' | 'payment'>('address')
  const [address, setAddress] = useState<Address>({ name: '', phone: '', street: '', city: '', state: '', pincode: '' })
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay')
  const [loading, setLoading] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponCode, setCouponCode] = useState('')

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(c)
    if (c.length === 0) router.push('/shop/cart')

    // get user info to pre-fill
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.success && d.data.addresses?.length > 0) {
        const def = d.data.addresses.find((a: Address & { isDefault: boolean }) => a.isDefault) || d.data.addresses[0]
        setAddress(def)
      }
    }).catch(() => {})

    const disc = sessionStorage.getItem('couponDiscount')
    const code = sessionStorage.getItem('couponCode')
    if (disc) setCouponDiscount(parseInt(disc))
    if (code) setCouponCode(code)
  }, [router])

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping = subtotal >= 999 ? 0 : 60
  const total = subtotal - couponDiscount + shipping

  const validateAddress = () => {
    const required = ['name', 'phone', 'street', 'city', 'state', 'pincode'] as (keyof Address)[]
    for (const field of required) {
      if (!address[field]) { toast.error(`Please fill ${field}`); return false }
    }
    if (!/^[6-9]\d{9}$/.test(address.phone)) { toast.error('Invalid phone number'); return false }
    if (!/^\d{6}$/.test(address.pincode)) { toast.error('Invalid pincode'); return false }
    return true
  }

  const placeOrder = async () => {
    if (!validateAddress()) return
    setLoading(true)

    try {
      const orderPayload = {
        items: cart.map(i => ({
          product: i._id, colorName: i.colorName, size: i.size, quantity: i.quantity,
        })),
        shippingAddress: address,
        paymentMethod,
        couponCode: couponCode || undefined,
        couponDiscount,
      }

      if (paymentMethod === 'cod') {
        const res = await fetch('/api/orders', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          credentials: 'include', body: JSON.stringify(orderPayload),
        }).then(r => r.json())

        if (res.success) {
          localStorage.removeItem('cart')
          sessionStorage.removeItem('couponCode')
          sessionStorage.removeItem('couponDiscount')
          toast.success('Order placed successfully!')
          router.push(`/shop/orders/${res.data._id}?success=true`)
        } else toast.error(res.message)
      } else {
        // Razorpay flow
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        document.body.appendChild(script)
        await new Promise(resolve => { script.onload = resolve })

        const rzpOrder = await fetch('/api/payments/create-order', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          credentials: 'include', body: JSON.stringify({ amount: total, receipt: `order_${Date.now()}` }),
        }).then(r => r.json())

        if (!rzpOrder.success) throw new Error(rzpOrder.message)

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: rzpOrder.data.amount,
          currency: 'INR',
          name: 'SSRK Trending Collections',
          description: 'Order Payment',
          order_id: rzpOrder.data.id,
          handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string }) => {
            const orderRes = await fetch('/api/orders', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                ...orderPayload,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
              }),
            }).then(r => r.json())

            if (orderRes.success) {
              await fetch(`/api/orders/${orderRes.data._id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ paymentStatus: 'paid', razorpayPaymentId: response.razorpay_payment_id }),
              })
              localStorage.removeItem('cart')
              toast.success('Payment successful! Order placed.')
              router.push(`/shop/orders/${orderRes.data._id}?success=true`)
            } else toast.error(orderRes.message)
          },
          prefill: { name: address.name, contact: address.phone },
          theme: { color: '#8B1A1A' },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order')
    } finally { setLoading(false) }
  }

  return (
    <ShopLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          {['address', 'payment'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === s || (i === 1 && step === 'payment') ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-400'}`}>
                {i + 1}
              </div>
              <span className={`text-sm font-medium capitalize ${step === s ? 'text-brand-red' : 'text-gray-400'}`}>{s}</span>
              {i === 0 && <div className="w-16 h-px bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {step === 'address' ? (
              <div className="bg-white border border-gray-100 p-6 rounded-sm">
                <h2 className="font-semibold text-lg mb-6 flex items-center gap-2"><FiPackage /> Delivery Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input className="input-field" value={address.name} onChange={e => setAddress(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone *</label>
                    <input className="input-field" value={address.phone} onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))} placeholder="10 digit number" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Street Address *</label>
                    <input className="input-field" value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} placeholder="House/Street/Area" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input className="input-field" value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} placeholder="City" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State *</label>
                    <select className="input-field" value={address.state} onChange={e => setAddress(p => ({ ...p, state: e.target.value }))}>
                      <option value="">Select State</option>
                      {['Tamil Nadu', 'Andhra Pradesh', 'Karnataka', 'Kerala', 'Telangana', 'Maharashtra', 'Delhi', 'Gujarat', 'Rajasthan', 'West Bengal', 'Uttar Pradesh', 'Punjab', 'Haryana'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pincode *</label>
                    <input className="input-field" value={address.pincode} onChange={e => setAddress(p => ({ ...p, pincode: e.target.value }))} placeholder="6 digit pincode" maxLength={6} />
                  </div>
                </div>
                <button onClick={() => { if (validateAddress()) setStep('payment') }}
                  className="btn-primary mt-6 w-full">Continue to Payment</button>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 p-6 rounded-sm">
                <h2 className="font-semibold text-lg mb-6 flex items-center gap-2"><FiCreditCard /> Payment Method</h2>

                <div className="space-y-3 mb-6">
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-sm cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-brand-red bg-brand-red/5' : 'border-gray-200'}`}>
                    <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="accent-brand-red" />
                    <div>
                      <p className="font-medium">Pay Online</p>
                      <p className="text-xs text-gray-500">UPI, Cards, Net Banking via Razorpay</p>
                    </div>
                    <div className="ml-auto flex gap-2 text-xs text-gray-400">
                      <span>💳</span><span>📱</span><span>🏦</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 border-2 rounded-sm cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-brand-red bg-brand-red/5' : 'border-gray-200'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-brand-red" />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Pay when you receive your order</p>
                    </div>
                    <span className="ml-auto text-2xl">💵</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                  <FiLock size={12} />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                <button onClick={() => setStep('address')} className="btn-secondary mb-3 w-full">← Back to Address</button>
                <button onClick={placeOrder} disabled={loading} className="btn-primary w-full">
                  {loading ? 'Processing...' : `Place Order • ₹${total.toLocaleString()}`}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-brand-cream p-6 rounded-sm border border-gray-100 h-fit">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={item.key} className="flex gap-3">
                  <div className="relative w-14 h-16 bg-white flex-shrink-0 rounded overflow-hidden">
                    {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-red text-white text-xs rounded-full flex items-center justify-center">{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.colorName} / {item.size}</p>
                    <p className="text-sm font-bold text-brand-red">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-₹{couponDiscount}</span></div>}
              <div className="flex justify-between"><span>Shipping</span><span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2"><span>Total</span><span className="text-brand-red">₹{total.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
