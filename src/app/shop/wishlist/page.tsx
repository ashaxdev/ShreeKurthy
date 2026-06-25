'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import ShopLayout from '@/components/layout/ShopLayout'
import ProductCard from '@/components/shop/ProductCard'
import { FiHeart } from 'react-icons/fi'

interface Product {
  _id: string; name: string; slug: string; basePrice: number; mrp: number
  images: string[]; averageRating: number; reviewCount: number; discount: number
  isNewArrival: boolean; isBestSeller: boolean
}

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem('wishlist') || '[]') as string[]
    if (ids.length === 0) { setLoading(false); return }

    Promise.all(ids.map(id => fetch(`/api/products/${id}`).then(r => r.json())))
      .then(results => setProducts(results.filter(r => r.success).map(r => r.data)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <ShopLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-3">
          <FiHeart className="text-brand-red" /> My Wishlist
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4] rounded-sm" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <FiHeart size={64} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">Your wishlist is empty</p>
            <Link href="/shop/products" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </ShopLayout>
  )
}
