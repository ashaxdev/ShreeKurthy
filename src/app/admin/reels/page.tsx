'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { FiPlus, FiX, FiUpload, FiPlay } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Product { _id: string; name: string }
interface Reel { _id: string; title: string; videoUrl: string; thumbnail?: string; isActive: boolean; views: number }

export default function AdminReelsPage() {
  const [reels, setReels] = useState<Reel[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ title: '', videoUrl: '', thumbnail: '', productIds: [] as string[] })

  const fetchData = async () => {
    setLoading(true)
    const [r, p] = await Promise.all([
      fetch('/api/reels?admin=true', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/products?admin=true&limit=100').then(r => r.json()),
    ])
    if (r.success) setReels(r.data)
    if (p.success) setProducts(p.data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleVideoUpload = async (file: File) => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'ssrk/reels')
    formData.append('type', 'video')
    const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData }).then(r => r.json())
    if (res.success) setForm(p => ({ ...p, videoUrl: res.data.url }))
    else toast.error('Upload failed')
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.videoUrl) return toast.error('Please upload a video')
    const res = await fetch('/api/reels', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form),
    }).then(r => r.json())
    if (res.success) { toast.success('Reel created'); setShowForm(false); fetchData() }
  }

  const toggleProduct = (id: string) => {
    setForm(p => ({ ...p, productIds: p.productIds.includes(id) ? p.productIds.filter(x => x !== id) : [...p.productIds, id] }))
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shop by Reels</h1>
        <button onClick={() => setShowForm(true)} className="btn-gold flex items-center gap-2 py-2 px-4 text-sm">
          <FiPlus size={16} /> Add Reel
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? <p className="text-gray-500">Loading...</p> : reels.map(r => (
          <div key={r._id} className="admin-card p-0 overflow-hidden">
            <div className="relative aspect-[9/16] bg-black flex items-center justify-center">
              <video src={r.videoUrl} className="w-full h-full object-cover" muted />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20"><FiPlay className="text-white" size={24} /></div>
            </div>
            <div className="p-3">
              <p className="text-gray-900 text-xs line-clamp-1">{r.title}</p>
              <p className="text-gray-500 text-xs">{r.views} views</p>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 shadow-xl rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900 font-semibold">New Reel</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-500 text-sm mb-1">Video *</label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-4 cursor-pointer hover:border-brand-red">
                  <FiUpload size={14} className="text-gray-400" />
                  <span className="text-gray-500 text-sm">{uploading ? 'Uploading...' : form.videoUrl ? 'Video uploaded ✓' : 'Upload video'}</span>
                  <input type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleVideoUpload(e.target.files[0])} />
                </label>
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">Title *</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:border-brand-red" />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-2">Tag Products</label>
                <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-2">
                  {products.map(p => (
                    <label key={p._id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                      <input type="checkbox" checked={form.productIds.includes(p._id)} onChange={() => toggleProduct(p._id)} className="accent-brand-red" />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-gold w-full">Create Reel</button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}