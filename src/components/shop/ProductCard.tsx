'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import toast from 'react-hot-toast'

interface Product {
  _id: string
  name: string
  slug: string
  basePrice: number
  mrp: number
  images: string[]
  averageRating: number
  reviewCount: number
  discount: number
  isNewArrival?: boolean
  isBestSeller?: boolean
  colorVariants?: { colorName: string; colorHex: string; images: string[] }[]
}

export default function ProductCard({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(() => {
    if (typeof window === 'undefined') return false
    const wl = JSON.parse(localStorage.getItem('wishlist') || '[]') as string[]
    return wl.includes(product._id)
  })
  const [imgIdx, setImgIdx] = useState(0)

  const discount = product.mrp > product.basePrice
    ? Math.round(((product.mrp - product.basePrice) / product.mrp) * 100)
    : product.discount || 0

  const images = product.colorVariants?.[0]?.images?.length
    ? product.colorVariants[0].images
    : product.images || []

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    const wl = JSON.parse(localStorage.getItem('wishlist') || '[]') as string[]
    const newWl = isWishlisted ? wl.filter((id: string) => id !== product._id) : [...wl, product._id]
    localStorage.setItem('wishlist', JSON.stringify(newWl))
    setIsWishlisted(!isWishlisted)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
    window.dispatchEvent(new Event('wishlistUpdated'))
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingIdx = cart.findIndex((i: { _id: string }) => i._id === product._id)
    if (existingIdx >= 0) {
      cart[existingIdx].quantity++
    } else {
      cart.push({
        _id: product._id, name: product.name, slug: product.slug,
        price: product.basePrice, mrp: product.mrp,
        image: images[0] || '', quantity: 1,
        colorName: product.colorVariants?.[0]?.colorName || 'Default',
        colorHex: product.colorVariants?.[0]?.colorHex || '#000',
        size: 'M',
      })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    toast.success('Added to cart!')
    window.dispatchEvent(new Event('cartUpdated'))
  }

  return (
    <Link href={`/shop/products/${product.slug}`} className="product-card group block">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gray-50 product-img-wrap overflow-hidden">
        {images[0] ? (
          <Image src={images[imgIdx] || images[0]} alt={product.name} fill
            className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-red/10 to-brand-gold/10">
            <span className="text-gray-300 text-4xl">👗</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNewArrival && <span className="badge bg-brand-green text-white text-xs">NEW</span>}
          {product.isBestSeller && <span className="badge bg-brand-gold text-white text-xs">BESTSELLER</span>}
          {discount > 0 && <span className="badge bg-brand-red text-white text-xs">{discount}% OFF</span>}
        </div>

        {/* Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleWishlist}
            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-brand-red hover:text-white transition-colors">
            {isWishlisted ? <FaHeart className="text-brand-red" size={14} /> : <FiHeart size={14} />}
          </button>
          <button onClick={handleAddToCart}
            className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-brand-red hover:text-white transition-colors">
            <FiShoppingCart size={14} />
          </button>
        </div>

        {/* Color dots - hover to preview */}
        {product.colorVariants && product.colorVariants.length > 1 && (
          <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {product.colorVariants.slice(0, 4).map((cv, i) => (
              <button key={i} onClick={(e) => { e.preventDefault(); setImgIdx(0) }}
                className="w-4 h-4 rounded-full border-2 border-white shadow"
                style={{ background: cv.colorHex }}
                title={cv.colorName} />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-800 line-clamp-2 leading-snug mb-1">{product.name}</h3>
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-1">
            <FiStar size={12} className="fill-brand-gold text-brand-gold" />
            <span className="text-xs text-gray-500">{product.averageRating} ({product.reviewCount})</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="font-bold text-brand-red text-sm">₹{product.basePrice.toLocaleString()}</span>
          {product.mrp > product.basePrice && (
            <span className="text-xs text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
