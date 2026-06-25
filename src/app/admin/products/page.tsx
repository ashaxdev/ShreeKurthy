'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AdminLayout from '@/components/admin/AdminLayout'
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Product {
  _id: string; name: string; slug: string; basePrice: number; mrp: number
  images: string[]; totalStock: number; totalSold: number; isActive: boolean
  isFeatured: boolean; category: { name: string }
  colorVariants: { images: string[] }[]
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchProducts = async () => {
    setLoading(true)
    const params = new URLSearchParams({ admin: 'true', page: String(page), limit: '20' })
    if (search) params.set('search', search)
    const res = await fetch(`/api/products?${params}`, { credentials: 'include' }).then(r => r.json())
    if (res.success) { setProducts(res.data); setTotal(res.pagination.total) }
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [page, search])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'include' }).then(r => r.json())
    if (res.success) { toast.success('Product deleted'); fetchProducts() }
    else toast.error(res.message)
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} products total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition shadow-sm"
        >
          <FiPlus size={15} /> Add Product
        </Link>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

        {/* Search bar */}
        <div className="p-5 border-b border-gray-100">
          <div className="relative max-w-sm">
            <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Table area */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading…</div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-gray-400 text-sm">No products found.</p>
            <Link href="/admin/products/new" className="text-red-600 text-sm font-medium hover:underline">
              Add your first product →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Product', 'Category', 'Price', 'Stock', 'Sold', 'Status', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 text-left ${i === 6 ? 'text-right' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const img = p.colorVariants?.[0]?.images?.[0] || p.images?.[0]
                  return (
                    <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">

                      {/* Product */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {img && <Image src={img} alt={p.name} fill className="object-cover" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-900 font-medium text-sm truncate max-w-[180px]">{p.name}</p>
                            {p.isFeatured && (
                              <span className="inline-block mt-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0 text-[10px] font-semibold">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5 text-gray-500 text-sm">{p.category?.name || '—'}</td>

                      {/* Price */}
                      <td className="px-5 py-3.5">
                        <span className="text-gray-900 font-medium">₹{p.basePrice.toLocaleString()}</span>
                        {p.mrp > p.basePrice && (
                          <span className="ml-1.5 text-gray-400 line-through text-xs">₹{p.mrp.toLocaleString()}</span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-3.5">
                        <span className={`font-medium text-sm ${p.totalStock === 0 ? 'text-red-500' : p.totalStock <= 10 ? 'text-amber-500' : 'text-gray-700'}`}>
                          {p.totalStock}
                        </span>
                      </td>

                      {/* Sold */}
                      <td className="px-5 py-3.5 text-gray-500 text-sm">{p.totalSold}</td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                          p.isActive
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${p._id}`}
                            className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition"
                          >
                            <FiEdit2 size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-gray-500 text-sm tabular-nums">
                {page} / {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}