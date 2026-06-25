'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import AdminLayout from '@/components/admin/AdminLayout'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Category { _id: string; name: string; slug: string; description?: string; image?: string; isActive: boolean }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', description: '', image: '', isActive: true })
  const [uploading, setUploading] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    const res = await fetch('/api/categories?admin=true', { credentials: 'include' }).then(r => r.json())
    if (res.success) setCategories(res.data)
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const openNew = () => { setEditing(null); setForm({ name: '', description: '', image: '', isActive: true }); setShowForm(true) }
  const openEdit = (cat: Category) => {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description || '', image: cat.image || '', isActive: cat.isActive })
    setShowForm(true)
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'ssrk/categories')
    const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData }).then(r => r.json())
    if (res.success) setForm(p => ({ ...p, image: res.data.url }))
    else toast.error('Upload failed')
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing ? `/api/categories/${editing._id}` : '/api/categories'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form),
    }).then(r => r.json())
    if (res.success) {
      toast.success(editing ? 'Category updated' : 'Category created')
      setShowForm(false)
      fetchCategories()
    } else toast.error(res.message)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE', credentials: 'include' }).then(r => r.json())
    if (res.success) { toast.success('Deleted'); fetchCategories() }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={openNew} className="bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 py-2 px-4 text-sm font-medium transition-colors">
          <FiPlus size={16} /> Add Category
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        {loading ? <p className="text-gray-500 text-center py-8">Loading...</p> : categories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No categories yet</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat._id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <div className="relative h-32 bg-gray-100">
                  {cat.image ? <Image src={cat.image} alt={cat.name} fill className="object-cover" /> :
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">{cat.name[0]}</div>}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-900 font-medium">{cat.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEdit(cat)} className="flex-1 text-xs py-1.5 bg-gray-100 text-gray-700 rounded flex items-center justify-center gap-1 hover:bg-gray-200 hover:text-red-600 transition-colors">
                      <FiEdit2 size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(cat._id)} className="flex-1 text-xs py-1.5 bg-gray-100 text-gray-700 rounded flex items-center justify-center gap-1 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <FiTrash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900 font-semibold">{editing ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-1">Name *</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500" />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500" />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Image</label>
                {form.image && <div className="relative w-full h-32 mb-2 rounded overflow-hidden border border-gray-200"><Image src={form.image} alt="" fill className="object-cover" /></div>}
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-3 cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-colors">
                  <FiUpload size={14} className="text-gray-400" />
                  <span className="text-gray-500 text-sm">{uploading ? 'Uploading...' : 'Upload image'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                </label>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="accent-red-600" />
                <span className="text-gray-700 text-sm">Active</span>
              </label>
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white rounded-lg w-full py-2.5 text-sm font-medium transition-colors">
                {editing ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}