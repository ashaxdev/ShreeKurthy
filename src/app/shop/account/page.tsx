'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ShopLayout from '@/components/layout/ShopLayout'
import toast from 'react-hot-toast'
import { FiUser, FiPackage, FiMapPin, FiLogOut, FiPlus, FiTrash2 } from 'react-icons/fi'

interface Address { name: string; phone: string; street: string; city: string; state: string; pincode: string; isDefault: boolean }
interface UserData { _id: string; name: string; email: string; phone?: string; addresses: Address[] }
interface Order { _id: string; orderNumber: string; total: number; status: string; createdAt: string; items: { name: string; quantity: number }[] }

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile')
  const [loading, setLoading] = useState(true)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState<Address>({ name: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json())
        if (!userRes.success) { router.push('/login'); return }
        setUser(userRes.data)

        const ordersRes = await fetch('/api/orders?limit=10', { credentials: 'include' }).then(r => r.json())
        if (ordersRes.success) setOrders(ordersRes.data)
      } catch { router.push('/login') }
      finally { setLoading(false) }
    }
    fetchData()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE', credentials: 'include' })
    localStorage.removeItem('token')
    toast.success('Logged out')
    router.push('/')
  }

  const statusColors: Record<string, string> = {
    pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
    shipped: 'badge-purple', delivered: 'badge-success', cancelled: 'badge-error', returned: 'badge-error',
  }

  if (loading) return <ShopLayout><div className="text-center py-20">Loading...</div></ShopLayout>
  if (!user) return null

  return (
    <ShopLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8">My Account</h1>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-1">
            {[
              ['profile', 'Profile', FiUser], ['orders', 'My Orders', FiPackage], ['addresses', 'Addresses', FiMapPin],
            ].map(([key, label, Icon]) => {
              const IconComp = Icon as React.ComponentType<{ size?: number }>
              return (
                <button key={key as string} onClick={() => setActiveTab(key as 'profile' | 'orders' | 'addresses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-sm transition-colors text-left
                    ${activeTab === key ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-brand-cream'}`}>
                  <IconComp size={16} /> {label as string}
                </button>
              )
            })}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-sm transition-colors">
              <FiLogOut size={16} /> Logout
            </button>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white border border-gray-100 p-6 rounded-sm">
                <h2 className="font-semibold text-lg mb-6">Profile Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-400 mb-1">Full Name</p><p className="font-medium">{user.name}</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Email</p><p className="font-medium">{user.email}</p></div>
                  <div><p className="text-xs text-gray-400 mb-1">Phone</p><p className="font-medium">{user.phone || '—'}</p></div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-gray-100 rounded-sm">
                    <FiPackage size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No orders yet</p>
                    <Link href="/shop/products" className="btn-primary">Start Shopping</Link>
                  </div>
                ) : orders.map(order => (
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

            {activeTab === 'addresses' && (
              <div className="bg-white border border-gray-100 p-6 rounded-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-lg">Saved Addresses</h2>
                  <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn-secondary py-2 px-4 text-sm flex items-center gap-1">
                    <FiPlus size={14} /> Add New
                  </button>
                </div>

                {user.addresses?.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {user.addresses.map((addr, i) => (
                      <div key={i} className="border border-gray-200 p-4 rounded-sm relative">
                        {addr.isDefault && <span className="badge badge-success absolute top-2 right-2">Default</span>}
                        <p className="font-medium">{addr.name}</p>
                        <p className="text-sm text-gray-500">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-sm text-gray-500">{addr.phone}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-400 text-sm mb-4">No saved addresses</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
