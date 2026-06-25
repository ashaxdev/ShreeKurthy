'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { FiAlertTriangle, FiDownload, FiPackage } from 'react-icons/fi'

interface SizeStock { size: string; stock: number }
interface ColorVariant { colorName: string; sizes: SizeStock[] }
interface Product { _id: string; name: string; totalStock: number; totalSold: number; averageRating: number; category: { name: string }; colorVariants: ColorVariant[] }

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [lowStock, setLowStock] = useState<Product[]>([])
  const [outOfStock, setOutOfStock] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')

  useEffect(() => {
    fetch('/api/reports?type=inventory', { credentials: 'include' }).then(r => r.json()).then(d => {
      if (d.success) {
        setProducts(d.data.products); setLowStock(d.data.lowStock); setOutOfStock(d.data.outOfStock)
      }
    }).finally(() => setLoading(false))
  }, [])

  const exportInventory = () => {
    const headers = ['Product', 'Category', 'Total Stock', 'Total Sold', 'Rating']
    const rows = products.map(p => [p.name, p.category?.name || '', p.totalStock, p.totalSold, p.averageRating])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `inventory-${Date.now()}.csv`; a.click()
  }

  const displayProducts = filter === 'low' ? lowStock : filter === 'out' ? outOfStock : products

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <button onClick={exportInventory} className="border border-red-600 text-red-600 hover:bg-red-50 rounded-lg py-2 px-4 text-sm flex items-center gap-2 transition-colors">
          <FiDownload size={14} /> Export
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center"><FiPackage size={22} className="text-blue-600" /></div>
          <div><p className="text-gray-500 text-xs">Total Products</p><p className="text-gray-900 text-xl font-bold">{products.length}</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center"><FiAlertTriangle size={22} className="text-orange-600" /></div>
          <div><p className="text-gray-500 text-xs">Low Stock (&lt;10)</p><p className="text-gray-900 text-xl font-bold">{lowStock.length}</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center"><FiAlertTriangle size={22} className="text-red-600" /></div>
          <div><p className="text-gray-500 text-xs">Out of Stock</p><p className="text-gray-900 text-xl font-bold">{outOfStock.length}</p></div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex gap-2 mb-6">
          {[['all', 'All Products'], ['low', 'Low Stock'], ['out', 'Out of Stock']].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key as 'all' | 'low' | 'out')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${filter === key ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{label}</button>
          ))}
        </div>

        {loading ? <p className="text-gray-500 text-center py-8">Loading...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left border-b border-gray-200">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Color/Size Breakdown</th>
                  <th className="pb-3 font-medium">Total Stock</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayProducts.map(p => (
                  <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-gray-900">{p.name}</td>
                    <td className="py-3 text-gray-700">{p.category?.name}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.colorVariants?.map((cv, i) => (
                          <span key={i} className="text-xs text-gray-500">
                            {cv.colorName}: {cv.sizes?.map(s => `${s.size}(${s.stock})`).join(', ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={p.totalStock === 0 ? 'text-red-600 font-bold' : p.totalStock <= 10 ? 'text-orange-600 font-bold' : 'text-gray-900'}>
                        {p.totalStock}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link href={`/admin/products/${p._id}`} className="text-red-600 text-xs hover:underline">Update Stock</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}