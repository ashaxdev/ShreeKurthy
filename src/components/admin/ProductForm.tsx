'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiUpload, FiX } from 'react-icons/fi'

interface SizeVariant { size: string; price: number; mrp: number; stock: number; sku: string }
interface ColorVariant { colorName: string; colorHex: string; images: string[]; sizes: SizeVariant[] }
interface Category { _id: string; name: string }

interface ProductFormData {
  _id?: string
  name: string; slug: string; description: string; shortDescription: string
  category: string; basePrice: number; mrp: number
  images: string[]; colorVariants: ColorVariant[]
  fabric: string; care: string; occasion: string; tags: string[]
  isFeatured: boolean; isNewArrival: boolean; isBestSeller: boolean; isActive: boolean
  seoTitle: string; seoDescription: string
}

const EMPTY_PRODUCT: ProductFormData = {
  name: '', slug: '', description: '', shortDescription: '', category: '',
  basePrice: 0, mrp: 0, images: [], colorVariants: [],
  fabric: '', care: '', occasion: '', tags: [],
  isFeatured: false, isNewArrival: false, isBestSeller: false, isActive: true,
  seoTitle: '', seoDescription: '',
}

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size']

/* ─── shared style tokens ─────────────────────────────────────── */
const card = 'bg-white rounded-2xl border border-gray-200 shadow-sm p-6'
const label = 'block text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide'
const input =
  'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition'
const inputSm =
  'bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-900 text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition'
const sectionHeading = 'text-gray-900 font-semibold text-base'

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter()
  const [form, setForm] = useState<ProductFormData>(EMPTY_PRODUCT)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    fetch('/api/categories?admin=true').then(r => r.json()).then(d => { if (d.success) setCategories(d.data) })
    if (productId) {
      fetch(`/api/products/${productId}`).then(r => r.json()).then(d => {
        if (d.success) setForm({ ...d.data, category: d.data.category?._id || d.data.category })
      })
    }
  }, [productId])

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData }).then(r => r.json())
    if (res.success) return res.data.url
    toast.error('Upload failed')
    return null
  }

  const addColorVariant = () =>
    setForm(p => ({ ...p, colorVariants: [...p.colorVariants, { colorName: '', colorHex: '#8B1A1A', images: [], sizes: [] }] }))

  const removeColorVariant = (idx: number) =>
    setForm(p => ({ ...p, colorVariants: p.colorVariants.filter((_, i) => i !== idx) }))

  const updateColorVariant = (idx: number, field: keyof ColorVariant, value: string | string[]) =>
    setForm(p => ({ ...p, colorVariants: p.colorVariants.map((cv, i) => i === idx ? { ...cv, [field]: value } : cv) }))

  const handleColorImageUpload = async (idx: number, files: FileList | null) => {
    if (!files) return
    setUploading(`color-${idx}`)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const url = await uploadFile(file, 'ssrk/products')
      if (url) urls.push(url)
    }
    setUploading(null)
    if (urls.length) updateColorVariant(idx, 'images', [...form.colorVariants[idx].images, ...urls])
  }

  const removeColorImage = (colorIdx: number, imgIdx: number) =>
    updateColorVariant(colorIdx, 'images', form.colorVariants[colorIdx].images.filter((_, i) => i !== imgIdx))

  const addSize = (colorIdx: number) =>
    setForm(p => ({
      ...p,
      colorVariants: p.colorVariants.map((cv, i) =>
        i === colorIdx ? { ...cv, sizes: [...cv.sizes, { size: '', price: p.basePrice || 0, mrp: p.mrp || 0, stock: 0, sku: '' }] } : cv
      )
    }))

  const updateSize = (colorIdx: number, sizeIdx: number, field: keyof SizeVariant, value: string | number) =>
    setForm(p => ({
      ...p,
      colorVariants: p.colorVariants.map((cv, i) =>
        i === colorIdx ? { ...cv, sizes: cv.sizes.map((s, si) => si === sizeIdx ? { ...s, [field]: value } : s) } : cv
      )
    }))

  const removeSize = (colorIdx: number, sizeIdx: number) =>
    setForm(p => ({
      ...p,
      colorVariants: p.colorVariants.map((cv, i) =>
        i === colorIdx ? { ...cv, sizes: cv.sizes.filter((_, si) => si !== sizeIdx) } : cv
      )
    }))

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(p => ({ ...p, tags: [...p.tags, tagInput.trim()] }))
      setTagInput('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.category) return toast.error('Please select a category')
    if (form.colorVariants.length === 0) return toast.error('Please add at least one color variant')
    setLoading(true)
    try {
      const payload = { ...form, slug: form.slug || generateSlug(form.name) }
      const url = productId ? `/api/products/${productId}` : '/api/products'
      const res = await fetch(url, {
        method: productId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      }).then(r => r.json())
      if (res.success) { toast.success(productId ? 'Product updated' : 'Product created'); router.push('/admin/products') }
      else toast.error(res.message)
    } catch { toast.error('Failed to save product') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-4xl">

      {/* ── Basic Information ── */}
      <div className={card}>
        <h2 className={`${sectionHeading} mb-5`}>Basic Information</h2>
        <div className="grid md:grid-cols-2 gap-4">

          <div className="md:col-span-2">
            <label className={label}>Product Name <span className="text-red-500">*</span></label>
            <input required value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: p.slug || generateSlug(e.target.value) }))}
              placeholder="e.g. Banarasi Silk Saree"
              className={input} />
          </div>

          <div>
            <label className={label}>URL Slug</label>
            <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
              placeholder="auto-generated-from-name" className={input} />
          </div>

          <div>
            <label className={label}>Category <span className="text-red-500">*</span></label>
            <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className={input}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={label}>Short Description</label>
            <input value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))}
              placeholder="Brief one-line summary shown in listings" className={input} />
          </div>

          <div className="md:col-span-2">
            <label className={label}>Full Description <span className="text-red-500">*</span></label>
            <textarea required rows={5} value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Detailed product description…"
              className={`${input} resize-none`} />
          </div>

          <div>
            <label className={label}>Base Price (₹) <span className="text-red-500">*</span></label>
            <input required type="number" value={form.basePrice || ''}
              onChange={e => setForm(p => ({ ...p, basePrice: Number(e.target.value) }))}
              placeholder="0" className={input} />
          </div>

          <div>
            <label className={label}>MRP (₹) <span className="text-red-500">*</span></label>
            <input required type="number" value={form.mrp || ''}
              onChange={e => setForm(p => ({ ...p, mrp: Number(e.target.value) }))}
              placeholder="0" className={input} />
          </div>

          <div>
            <label className={label}>Fabric</label>
            <input value={form.fabric} onChange={e => setForm(p => ({ ...p, fabric: e.target.value }))}
              placeholder="e.g. Pure Cotton, Silk" className={input} />
          </div>

          <div>
            <label className={label}>Occasion</label>
            <input value={form.occasion} onChange={e => setForm(p => ({ ...p, occasion: e.target.value }))}
              placeholder="e.g. Wedding, Casual" className={input} />
          </div>

          <div className="md:col-span-2">
            <label className={label}>Care Instructions</label>
            <input value={form.care} onChange={e => setForm(p => ({ ...p, care: e.target.value }))}
              placeholder="e.g. Dry clean only" className={input} />
          </div>

          {/* Tags */}
          <div className="md:col-span-2">
            <label className={label}>Tags</label>
            <div className="flex gap-2 mb-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="Type a tag and press Enter"
                className={`${input} flex-1`} />
              <button type="button" onClick={addTag}
                className="px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map(tag => (
                <span key={tag}
                  className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-0.5 text-xs font-medium">
                  {tag}
                  <button type="button" onClick={() => setForm(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))}
                    className="hover:text-red-900 transition">
                    <FiX size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Status toggles */}
        <div className="flex flex-wrap gap-5 mt-5 pt-5 border-t border-gray-100">
          {[['isFeatured', 'Featured'], ['isNewArrival', 'New Arrival'], ['isBestSeller', 'Best Seller'], ['isActive', 'Active']] .map(([key, lbl]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form[key as keyof ProductFormData] as boolean}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))}
                className="w-4 h-4 accent-red-600 rounded" />
              <span className="text-gray-700 text-sm">{lbl}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Color Variants ── */}
      <div className={card}>
        <div className="flex items-center justify-between mb-5">
          <h2 className={sectionHeading}>Color Variants &amp; Sizes</h2>
          <button type="button" onClick={addColorVariant}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition">
            <FiPlus size={14} /> Add Color
          </button>
        </div>

        {form.colorVariants.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-xl py-12 text-center">
            <p className="text-gray-400 text-sm">No color variants yet.</p>
            <p className="text-gray-400 text-xs mt-1">Click "Add Color" to get started.</p>
          </div>
        )}

        <div className="space-y-4">
          {form.colorVariants.map((cv, colorIdx) => (
            <div key={colorIdx} className="border border-gray-200 rounded-xl p-4 bg-gray-50">

              {/* Color name + hex */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className={label}>Color Name</label>
                    <input value={cv.colorName} onChange={e => updateColorVariant(colorIdx, 'colorName', e.target.value)}
                      placeholder="e.g. Maroon" className={input} />
                  </div>
                  <div>
                    <label className={label}>Color Hex</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={cv.colorHex}
                        onChange={e => updateColorVariant(colorIdx, 'colorHex', e.target.value)}
                        className="w-10 h-[42px] rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white" />
                      <input value={cv.colorHex} onChange={e => updateColorVariant(colorIdx, 'colorHex', e.target.value)}
                        className={`${input} flex-1`} />
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => removeColorVariant(colorIdx)}
                  className="mt-6 text-gray-400 hover:text-red-500 transition">
                  <FiTrash2 size={17} />
                </button>
              </div>

              {/* Images */}
              <div className="mb-4">
                <label className={label}>Images for this color</label>
                <div className="flex flex-wrap gap-2">
                  {cv.images.map((img, imgIdx) => (
                    <div key={imgIdx} className="relative w-16 h-16 rounded-lg overflow-hidden group border border-gray-200">
                      <Image src={img} alt="" fill className="object-cover" />
                      <button type="button" onClick={() => removeColorImage(colorIdx, imgIdx)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <FiTrash2 size={13} className="text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors bg-white">
                    {uploading === `color-${colorIdx}`
                      ? <span className="text-gray-400 text-[10px] text-center leading-tight px-1">Uploading…</span>
                      : <FiUpload size={15} className="text-gray-400" />
                    }
                    <input type="file" multiple accept="image/*" className="hidden"
                      onChange={e => handleColorImageUpload(colorIdx, e.target.files)} />
                  </label>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={label}>Sizes, Price &amp; Stock</label>
                  <button type="button" onClick={() => addSize(colorIdx)}
                    className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 text-xs font-medium transition">
                    <FiPlus size={12} /> Add Size
                  </button>
                </div>
                {cv.sizes.length > 0 && (
                  <div className="grid grid-cols-12 gap-2 mb-1 px-0.5">
                    {['Size', 'Price', 'MRP', 'Stock', 'SKU', ''].map((h, i) => (
                      <span key={i} className={`text-[10px] text-gray-400 uppercase font-medium ${i === 0 ? 'col-span-3' : i < 4 ? 'col-span-2' : i === 4 ? 'col-span-2' : 'col-span-1'}`}>{h}</span>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  {cv.sizes.map((sz, sizeIdx) => (
                    <div key={sizeIdx} className="grid grid-cols-12 gap-2 items-center">
                      <select value={sz.size} onChange={e => updateSize(colorIdx, sizeIdx, 'size', e.target.value)}
                        className={`col-span-3 ${inputSm}`}>
                        <option value="">Size</option>
                        {COMMON_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                        <option value="custom">Custom…</option>
                      </select>
                      <input type="number" placeholder="Price" value={sz.price || ''}
                        onChange={e => updateSize(colorIdx, sizeIdx, 'price', Number(e.target.value))}
                        className={`col-span-2 ${inputSm}`} />
                      <input type="number" placeholder="MRP" value={sz.mrp || ''}
                        onChange={e => updateSize(colorIdx, sizeIdx, 'mrp', Number(e.target.value))}
                        className={`col-span-2 ${inputSm}`} />
                      <input type="number" placeholder="Stock" value={sz.stock || ''}
                        onChange={e => updateSize(colorIdx, sizeIdx, 'stock', Number(e.target.value))}
                        className={`col-span-2 ${inputSm}`} />
                      <input placeholder="SKU" value={sz.sku}
                        onChange={e => updateSize(colorIdx, sizeIdx, 'sku', e.target.value)}
                        className={`col-span-2 ${inputSm}`} />
                      <button type="button" onClick={() => removeSize(colorIdx, sizeIdx)}
                        className="col-span-1 flex justify-center text-gray-400 hover:text-red-500 transition">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SEO ── */}
      <div className={card}>
        <h2 className={`${sectionHeading} mb-5`}>SEO Settings</h2>
        <div className="space-y-4">
          <div>
            <label className={label}>SEO Title</label>
            <input value={form.seoTitle} onChange={e => setForm(p => ({ ...p, seoTitle: e.target.value }))}
              placeholder="Page title shown in search results" className={input} />
          </div>
          <div>
            <label className={label}>Meta Description</label>
            <textarea rows={2} value={form.seoDescription}
              onChange={e => setForm(p => ({ ...p, seoDescription: e.target.value }))}
              placeholder="Brief description shown under the search result title…"
              className={`${input} resize-none`} />
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pb-6">
        <button type="submit" disabled={loading}
          className="px-8 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition shadow-sm">
          {loading ? 'Saving…' : productId ? 'Update Product' : 'Create Product'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition">
          Cancel
        </button>
      </div>

    </form>
  )
}