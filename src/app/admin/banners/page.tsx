'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import AdminLayout from '@/components/admin/AdminLayout'
import { FiPlus, FiX, FiUpload, FiEdit2, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Banner { _id: string; title: string; subtitle?: string; image: string; link?: string; buttonText?: string; isActive: boolean; type: string }

const emptyForm = { title: '', subtitle: '', image: '', link: '', buttonText: 'Shop Now', type: 'hero', isActive: true }

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchBanners = async () => {
    setLoading(true)
    const res = await fetch('/api/banners?admin=true', { credentials: 'include' }).then(r => r.json())
    if (res.success) setBanners(res.data)
    setLoading(false)
  }

  useEffect(() => { fetchBanners() }, [])

  const handleUpload = async (file: File) => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'ssrk/banners')
    const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData }).then(r => r.json())
    if (res.success) setForm(p => ({ ...p, image: res.data.url }))
    setUploading(false)
  }

  const openCreateForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEditForm = (banner: Banner) => {
    setEditingId(banner._id)
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image: banner.image,
      link: banner.link || '',
      buttonText: banner.buttonText || 'Shop Now',
      type: banner.type,
      isActive: banner.isActive,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.image) return toast.error('Please upload an image')
    setSubmitting(true)
    try {
      const url = editingId ? `/api/banners/${editingId}` : '/api/banners'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form),
      }).then(r => r.json())
      if (res.success) {
        toast.success(editingId ? 'Banner updated' : 'Banner created')
        closeForm()
        fetchBanners()
      } else {
        toast.error(res.message || 'Something went wrong')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner? This cannot be undone.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE', credentials: 'include' }).then(r => r.json())
      if (res.success) {
        toast.success('Banner deleted')
        setBanners(prev => prev.filter(b => b._id !== id))
      } else {
        toast.error(res.message || 'Failed to delete banner')
      }
    } catch {
      toast.error('Failed to delete banner')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your storefront banners</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <FiPlus size={15} /> Add Banner
        </button>
      </div>

      {/* Banner Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : banners.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-400 text-sm">No banners yet. Add your first one.</p>
          </div>
        ) : banners.map(b => (
          <div key={b._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="relative h-40">
              <Image src={b.image} alt={b.title} fill className="object-cover" />
              <span className={`absolute top-2 right-2 text-xs font-medium px-2.5 py-1 rounded-full
                ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {b.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-gray-900 font-semibold text-sm">{b.title}</p>
                  {b.subtitle && <p className="text-gray-500 text-sm mt-0.5">{b.subtitle}</p>}
                  <span className="inline-block mt-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded capitalize">
                    {b.type} banner
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openEditForm(b)}
                    title="Edit banner"
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiEdit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    disabled={deletingId === b._id}
                    title="Delete banner"
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-gray-900 font-semibold text-base">{editingId ? 'Edit Banner' : 'New Banner'}</h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Banner Image *</label>
                {form.image && (
                  <div className="relative w-full h-32 mb-2 rounded-lg overflow-hidden border border-gray-200">
                    <Image src={form.image} alt="" fill className="object-cover" />
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-red-400 rounded-lg py-3.5 cursor-pointer transition-colors group">
                  <FiUpload size={14} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                  <span className="text-sm text-gray-400 group-hover:text-red-400 transition-colors">
                    {uploading ? 'Uploading...' : form.image ? 'Replace banner image' : 'Upload banner image'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                </label>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Summer Sale"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle</label>
                <input
                  value={form.subtitle}
                  onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
                  placeholder="Optional tagline"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition"
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Link</label>
                <input
                  value={form.link}
                  onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
                  placeholder="/shop/products"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition"
                />
              </div>

              {/* Button Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Text</label>
                <input
                  value={form.buttonText}
                  onChange={e => setForm(p => ({ ...p, buttonText: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition"
                >
                  <option value="hero">Hero</option>
                  <option value="promo">Promo</option>
                  <option value="category">Category</option>
                </select>
              </div>

              {/* Active toggle (only meaningful once editing existing banners) */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Active</label>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                  className={`w-10 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-red-600' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-4' : ''}`} />
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-1 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Banner' : 'Create Banner'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}