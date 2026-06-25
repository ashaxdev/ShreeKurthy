'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import AdminLayout from '@/components/admin/AdminLayout'
import { FiStar, FiCheck, FiX, FiPlus, FiUpload, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Review {
  _id: string; userName: string; rating: number; comment: string; title?: string
  images?: string[]; isApproved: boolean; isVerified: boolean; createdAt: string
  product: { _id: string; name: string }
}
interface Product { _id: string; name: string }

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending'>('pending')
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ product: '', userName: '', rating: 5, title: '', comment: '', images: [] as string[] })

  const fetchData = async () => {
    setLoading(true)
    const [r, p] = await Promise.all([
      fetch('/api/reviews?admin=true', { credentials: 'include' }).then(res => res.json()),
      fetch('/api/products?admin=true&limit=200').then(res => res.json()),
    ])
    if (r.success) setReviews(r.data)
    if (p.success) setProducts(p.data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const updateApproval = async (id: string, isApproved: boolean) => {
    const res = await fetch(`/api/reviews/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      credentials: 'include', body: JSON.stringify({ isApproved }),
    }).then(r => r.json())
    if (res.success) {
      toast.success(isApproved ? 'Review approved' : 'Review rejected')
      fetchData()
    } else toast.error(res.message)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE', credentials: 'include' }).then(r => r.json())
    if (res.success) { toast.success('Deleted'); fetchData() }
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'ssrk/reviews')
      const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData }).then(r => r.json())
      if (res.success) urls.push(res.data.url)
    }
    setForm(p => ({ ...p, images: [...p.images, ...urls] }))
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.product) return toast.error('Select a product')
    const res = await fetch('/api/reviews', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ ...form, isAdminCreated: true, isApproved: true }),
    }).then(r => r.json())
    if (res.success) {
      toast.success('Review added')
      setShowForm(false)
      setForm({ product: '', userName: '', rating: 5, title: '', comment: '', images: [] })
      fetchData()
    } else toast.error(res.message)
  }

  const displayReviews = filter === 'pending' ? reviews.filter(r => !r.isApproved) : reviews

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <button onClick={() => setShowForm(true)} className="btn-gold flex items-center gap-2 py-2 px-4 text-sm">
          <FiPlus size={16} /> Add Review
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {[['pending', 'Pending Approval'], ['all', 'All Reviews']].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key as 'all' | 'pending')}
            className={`px-4 py-2 rounded-lg text-sm ${filter === key ? 'bg-brand-red text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>{label}</button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? <p className="text-gray-500">Loading...</p> : displayReviews.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No reviews to show</p>
        ) : displayReviews.map(r => (
          <div key={r._id} className="admin-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-gray-900 font-medium">{r.userName}</p>
                  {r.isVerified && <span className="badge badge-info text-xs">Verified</span>}
                </div>
                <p className="text-gray-500 text-xs">on {r.product?.name}</p>
                <div className="flex items-center gap-0.5 mt-2">
                  {[1,2,3,4,5].map(s => <FiStar key={s} size={14} className={s <= r.rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-300'} />)}
                </div>
                {r.title && <p className="text-gray-900 text-sm font-medium mt-2">{r.title}</p>}
                <p className="text-gray-600 text-sm mt-1">{r.comment}</p>
                {r.images && r.images.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {r.images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded overflow-hidden">
                        <Image src={img} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-gray-400 text-xs mt-2">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!r.isApproved ? (
                  <>
                    <button onClick={() => updateApproval(r._id, true)} className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200"><FiCheck size={14} /></button>
                    <button onClick={() => handleDelete(r._id)} className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"><FiX size={14} /></button>
                  </>
                ) : (
                  <>
                    <span className="badge badge-success">Approved</span>
                    <button onClick={() => handleDelete(r._id)} className="text-gray-400 hover:text-red-500"><FiTrash2 size={14} /></button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 shadow-xl rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900 font-semibold">Add Review</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-500 text-sm mb-1">Product *</label>
                <select required value={form.product} onChange={e => setForm(p => ({ ...p, product: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm">
                  <option value="">Select product</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">Reviewer Name *</label>
                <input required value={form.userName} onChange={e => setForm(p => ({ ...p, userName: e.target.value }))} placeholder="Customer name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">Rating *</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setForm(p => ({ ...p, rating: s }))}>
                      <FiStar size={24} className={s <= form.rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-300'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">Title</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Great quality!"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">Comment *</label>
                <textarea required rows={3} value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">Review Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded overflow-hidden group">
                      <Image src={img} alt="" fill className="object-cover" />
                      <button type="button" onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                        <FiTrash2 size={14} className="text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-brand-red">
                    {uploading ? <span className="text-gray-500 text-xs">...</span> : <FiUpload size={16} className="text-gray-400" />}
                    <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files)} />
                  </label>
                </div>
              </div>
              <button type="submit" className="btn-gold w-full">Add Review</button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}