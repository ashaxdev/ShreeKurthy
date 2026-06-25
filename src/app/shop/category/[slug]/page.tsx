'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import ShopLayout from '@/components/layout/ShopLayout'
import ProductCard from '@/components/shop/ProductCard'

interface Product {
  _id: string; name: string; slug: string; basePrice: number; mrp: number
  images: string[]; averageRating: number; reviewCount: number; discount: number
  isNewArrival: boolean; isBestSeller: boolean
}
interface Category { _id: string; name: string; description?: string; seoTitle?: string; seoDescription?: string }

export default function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const catRes = await fetch(`/api/categories/${slug}`).then(r => r.json())
    if (catRes.success) {
      setCategory(catRes.data)
      const prodRes = await fetch(`/api/products?category=${catRes.data._id}&page=${page}&limit=16`).then(r => r.json())
      if (prodRes.success) {
        setProducts(page === 1 ? prodRes.data : prev => [...prev, ...prodRes.data])
        setTotal(prodRes.pagination.total)
      }
    }
    setLoading(false)
  }, [slug, page])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <ShopLayout>
      <div className="bg-brand-cream border-b border-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-brand-dark">{category?.name || 'Loading...'}</h1>
          {category?.description && <p className="text-gray-500 text-sm mt-2 max-w-2xl">{category.description}</p>}
          <p className="text-gray-500 text-sm mt-1">{total} products</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4] rounded-sm" />)}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-20">No products found in this category yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
            {products.length < total && (
              <div className="text-center mt-10">
                <button onClick={() => setPage(p => p + 1)} className="btn-secondary px-12">Load More</button>
              </div>
            )}
          </>
        )}
      </div>
    </ShopLayout>
  )
}
