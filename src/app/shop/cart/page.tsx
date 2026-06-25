'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ShopLayout from '@/components/layout/ShopLayout'
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiTag } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface CartItem {
  key: string; _id: string; name: string; slug: string; price: number; mrp: number
  image: string; quantity: number; colorName: string; colorHex: string; size: string; sku?: string
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [coupon, setCoupon] = useState('')
  const [couponData, setCouponData] = useState<{ code: string; discount: number; description: string } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'))
  }, [])

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const updateQty = (key: string, delta: number) => {
    const newCart = cart.map(item =>
      item.key === key ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    )
    saveCart(newCart)
  }

  const removeItem = (key: string) => {
    saveCart(cart.filter(item => item.key !== key))
    toast.success('Removed from cart')
  }

  const applyCoupon = async () => {
    if (!coupon.trim()) return
    setCouponLoading(true)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon, orderAmount: subtotal }),
      }).then(r => r.json())
      if (res.success) {
        setCouponData(res.data)
        toast.success(`Coupon applied! Save ₹${res.data.discount}`)
      } else toast.error(res.message)
    } catch { toast.error('Failed to apply coupon') }
    finally { setCouponLoading(false) }
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping = subtotal >= 999 ? 0 : 60
  const discount = couponData?.discount || 0
  const total = subtotal - discount + shipping

  if (cart.length === 0) return (
    <ShopLayout>
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <FiShoppingBag size={80} className="text-gray-200 mb-6" />
        <h2 className="font-display text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet</p>
        <Link href="/shop/products" className="btn-primary">Start Shopping</Link>
      </div>
    </ShopLayout>
  )

  return (
    <ShopLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8">Shopping Cart <span className="text-gray-400 text-xl font-normal">({cart.length} items)</span></h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.key} className="flex gap-4 p-4 border border-gray-100 rounded-sm bg-white">
                <Link href={`/shop/products/${item.slug}`} className="relative w-24 h-32 flex-shrink-0 bg-gray-50">
                  {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">👗</div>}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/shop/products/${item.slug}`} className="font-medium text-sm hover:text-brand-red line-clamp-2">{item.name}</Link>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full inline-block border border-gray-200" style={{ background: item.colorHex }} />
                      {item.colorName}
                    </span>
                    <span>Size: {item.size}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="font-bold text-brand-red">₹{(item.price * item.quantity).toLocaleString()}</span>
                      {item.mrp > item.price && <span className="ml-2 text-xs text-gray-400 line-through">₹{(item.mrp * item.quantity).toLocaleString()}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200">
                        <button onClick={() => updateQty(item.key, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"><FiMinus size={12} /></button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQty(item.key, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"><FiPlus size={12} /></button>
                      </div>
                      <button onClick={() => removeItem(item.key)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-brand-cream p-6 h-fit rounded-sm border border-gray-100">
            <h2 className="font-semibold text-lg mb-6">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input type="text" placeholder="Enter coupon code" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
                  className="input-field py-2 text-sm flex-1" />
                <button onClick={applyCoupon} disabled={couponLoading} className="btn-primary py-2 px-4 text-sm whitespace-nowrap">
                  Apply
                </button>
              </div>
              {couponData && (
                <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                  <FiTag size={14} />
                  <span>{couponData.description} • Save ₹{couponData.discount}</span>
                  <button onClick={() => { setCouponData(null); setCoupon('') }} className="text-red-400 ml-auto">✕</button>
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div className="space-y-3 text-sm border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              {shipping > 0 && <p className="text-xs text-gray-400">Add ₹{(999 - subtotal).toLocaleString()} more for free shipping</p>}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-brand-red">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <Link href="/shop/checkout"
              onClick={() => {
                if (couponData?.code) sessionStorage.setItem('couponCode', couponData.code)
                sessionStorage.setItem('couponDiscount', String(discount))
              }}
              className="btn-primary w-full text-center block mt-6">
              Proceed to Checkout
            </Link>
            <Link href="/shop/products" className="block text-center text-sm text-gray-500 mt-3 hover:text-brand-red">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
