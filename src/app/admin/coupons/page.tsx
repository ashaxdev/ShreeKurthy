'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { FiPlus, FiX, FiCopy } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Coupon { _id: string; code: string; description: string; type: string; value: number; minOrderAmount: number; maxDiscount?: number; usageLimit: number; usedCount: number; isActive: boolean; expiresAt: string }

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', description: '', type: 'percentage', value: 0, minOrderAmount: 0, maxDiscount: 0, usageLimit: 100, userLimit: 1, expiresAt: '' })

  const fetchCoupons = async () => {
    setLoading(true)
    const res = await fetch('/api/coupons', { credentials: 'include' }).then(r => r.json())
    if (res.success) setCoupons(res.data)
    setLoading(false)
  }

  useEffect(() => { fetchCoupons() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/coupons', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form),
    }).then(r => r.json())
    if (res.success) { toast.success('Coupon created'); setShowForm(false); fetchCoupons() }
    else toast.error(res.message)
  }

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); toast.success('Copied!') }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button onClick={() => setShowForm(true)} className="bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 py-2 px-4 text-sm font-medium transition-colors">
          <FiPlus size={16} /> Create Coupon
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {loading ? <p className="text-gray-500">Loading...</p> : coupons.map(c => (
          <div key={c._id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-red-600 text-lg">{c.code}</span>
              <button onClick={() => copyCode(c.code)} className="text-gray-400 hover:text-gray-700"><FiCopy size={14} /></button>
            </div>
            <p className="text-gray-700 text-sm mb-3">{c.description}</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p>Discount: {c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`} {c.maxDiscount ? `(max ₹${c.maxDiscount})` : ''}</p>
              <p>Min order: ₹{c.minOrderAmount}</p>
              <p>Used: {c.usedCount}/{c.usageLimit}</p>
              <p>Expires: {new Date(c.expiresAt).toLocaleDateString('en-IN')}</p>
            </div>
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-3 ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {c.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900 font-semibold">New Coupon</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-1">Coupon Code *</label>
                <input required value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="WELCOME20"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500" />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Description *</label>
                <input required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="20% off on first order"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Value *</label>
                  <input required type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: Number(e.target.value) }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500" />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Min Order (₹)</label>
                  <input type="number" value={form.minOrderAmount} onChange={e => setForm(p => ({ ...p, minOrderAmount: Number(e.target.value) }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500" />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Max Discount (₹)</label>
                  <input type="number" value={form.maxDiscount} onChange={e => setForm(p => ({ ...p, maxDiscount: Number(e.target.value) }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500" />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Usage Limit</label>
                  <input type="number" value={form.usageLimit} onChange={e => setForm(p => ({ ...p, usageLimit: Number(e.target.value) }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500" />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Expires At *</label>
                  <input required type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500" />
                </div>
              </div>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white rounded-lg w-full py-2.5 text-sm font-medium transition-colors">
                Create Coupon
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}