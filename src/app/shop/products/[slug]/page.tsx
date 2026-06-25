'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import ShopLayout from '@/components/layout/ShopLayout'
import { FiShoppingCart, FiHeart, FiShare2, FiStar, FiMinus, FiPlus, FiTruck, FiRefreshCw, FiUpload, FiX, FiCamera } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'
import toast from 'react-hot-toast'

interface SizeVariant { size: string; price: number; mrp: number; stock: number; sku?: string }
interface ColorVariant { colorName: string; colorHex: string; images: string[]; sizes: SizeVariant[] }
interface Product {
  _id: string; name: string; slug: string; description: string; shortDescription?: string
  basePrice: number; mrp: number; images: string[]; colorVariants: ColorVariant[]
  availableSizes: string[]; category: { name: string; slug: string }
  fabric?: string; care?: string; occasion?: string; averageRating: number; reviewCount: number
  isBestSeller: boolean; isNewArrival: boolean; tags: string[]
  seoTitle?: string; seoDescription?: string
}

interface Review { _id: string; userName: string; rating: number; title?: string; comment: string; images?: string[]; isVerified: boolean; createdAt: string }

export default function ProductPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState<'desc' | 'details' | 'reviews'>('desc')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ userName: '', rating: 5, title: '', comment: '', images: [] as string[] })
  const [reviewUploading, setReviewUploading] = useState(false)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [pd, rv] = await Promise.all([
          fetch(`/api/products/${slug}`).then(r => r.json()),
          fetch(`/api/reviews?product=${slug}`).then(r => r.json()),
        ])
        if (pd.success) {
          setProduct(pd.data)
          if (pd.data.colorVariants?.[0]?.sizes?.[0]) {
            setSelectedSize(pd.data.colorVariants[0].sizes[0].size)
          }
          const wl = JSON.parse(localStorage.getItem('wishlist') || '[]') as string[]
          setIsWishlisted(wl.includes(pd.data._id))
        }
        if (rv.success) setReviews(rv.data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    if (slug) fetchProduct()
  }, [slug])

  if (loading) return (
    <ShopLayout>
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="skeleton aspect-square rounded-lg" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-6 w-1/2 rounded" />
            <div className="skeleton h-20 rounded" />
          </div>
        </div>
      </div>
    </ShopLayout>
  )

  if (!product) return (
    <ShopLayout>
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Product not found</p>
        <Link href="/shop/products" className="btn-primary">Back to Products</Link>
      </div>
    </ShopLayout>
  )

  const currentColorVariant = product.colorVariants?.[selectedColor]
  const currentImages = currentColorVariant?.images?.length ? currentColorVariant.images : product.images
  const currentSizeVariant = currentColorVariant?.sizes?.find(s => s.size === selectedSize)
  const displayPrice = currentSizeVariant?.price || product.basePrice
  const displayMrp = currentSizeVariant?.mrp || product.mrp
  const inStock = (currentSizeVariant?.stock || 0) > 0
  const discountPct = displayMrp > displayPrice ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100) : 0

  const addToCart = () => {
    if (!selectedSize) return toast.error('Please select a size')
    if (!inStock) return toast.error('Out of stock')
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const key = `${product._id}-${currentColorVariant?.colorName}-${selectedSize}`
    const idx = cart.findIndex((i: { key: string }) => i.key === key)
    if (idx >= 0) { cart[idx].quantity += quantity } else {
      cart.push({
        key, _id: product._id, name: product.name, slug: product.slug,
        price: displayPrice, mrp: displayMrp,
        image: currentImages[0] || '', quantity,
        colorName: currentColorVariant?.colorName || '',
        colorHex: currentColorVariant?.colorHex || '#000',
        size: selectedSize, sku: currentSizeVariant?.sku,
      })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    toast.success('Added to cart!')
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const buyNow = () => {
    addToCart()
    router.push('/shop/cart')
  }

  const toggleWishlist = () => {
    const wl = JSON.parse(localStorage.getItem('wishlist') || '[]') as string[]
    const newWl = isWishlisted ? wl.filter(id => id !== product._id) : [...wl, product._id]
    localStorage.setItem('wishlist', JSON.stringify(newWl))
    setIsWishlisted(!isWishlisted)
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handleReviewImageUpload = async (files: FileList | null) => {
    if (!files) return
    setReviewUploading(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files).slice(0, 5 - reviewForm.images.length)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'ssrk/reviews')
        const res = await fetch('/api/upload', { method: 'POST', credentials: 'include', body: formData }).then(r => r.json())
        if (res.success) urls.push(res.data.url)
        else toast.error('You must be logged in to upload images')
      }
      setReviewForm(p => ({ ...p, images: [...p.images, ...urls] }))
    } catch { toast.error('Upload failed') }
    finally { setReviewUploading(false) }
  }

  const removeReviewImage = (idx: number) => {
    setReviewForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewForm.userName.trim()) return toast.error('Please enter your name')
    if (!reviewForm.comment.trim()) return toast.error('Please write a comment')

    setReviewSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...reviewForm, product: product._id }),
      }).then(r => r.json())

      if (res.success) {
        toast.success('Thank you! Your review has been submitted for approval.')
        setShowReviewForm(false)
        setReviewForm({ userName: '', rating: 5, title: '', comment: '', images: [] })
      } else {
        if (res.message === 'Unauthorized') toast.error('Please login to write a review')
        else toast.error(res.message)
      }
    } catch { toast.error('Failed to submit review') }
    finally { setReviewSubmitting(false) }
  }

  return (
    <ShopLayout>
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-brand-cream">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-red">Home</Link>
          <span>/</span>
          <Link href="/shop/products" className="hover:text-brand-red">Products</Link>
          <span>/</span>
          {product.category && <Link href={`/shop/category/${product.category.slug}`} className="hover:text-brand-red">{product.category.name}</Link>}
          <span>/</span>
          <span className="text-brand-red line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-square bg-gray-50 rounded-sm overflow-hidden mb-4">
              {currentImages[selectedImage] ? (
                <Image src={currentImages[selectedImage]} alt={product.name} fill
                  className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200 text-8xl">👗</div>
              )}
              {discountPct > 0 && (
                <div className="absolute top-4 left-4 bg-brand-red text-white text-sm font-bold px-3 py-1">{discountPct}% OFF</div>
              )}
            </div>
            {currentImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {currentImages.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`relative flex-none w-20 h-20 rounded-sm overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-brand-red' : 'border-transparent'}`}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                {product.category && <Link href={`/shop/category/${product.category.slug}`}
                  className="text-xs text-brand-gold tracking-widest font-medium hover:text-brand-gold-dark">
                  {product.category.name.toUpperCase()}
                </Link>}
                <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-dark mt-1">{product.name}</h1>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={toggleWishlist}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-red transition-colors">
                  {isWishlisted ? <FaHeart className="text-brand-red" size={16} /> : <FiHeart size={16} />}
                </button>
                <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-red transition-colors">
                  <FiShare2 size={16} />
                </button>
              </div>
            </div>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <FiStar key={s} size={16} className={s <= product.averageRating ? 'fill-brand-gold text-brand-gold' : 'text-gray-300'} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-brand-red">₹{displayPrice.toLocaleString()}</span>
              {displayMrp > displayPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">₹{displayMrp.toLocaleString()}</span>
                  <span className="badge badge-error text-sm">{discountPct}% OFF</span>
                </>
              )}
            </div>

            {/* Color Selection */}
            {product.colorVariants?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Color: <span className="text-brand-red font-normal">{currentColorVariant?.colorName}</span>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {product.colorVariants.map((cv, i) => (
                    <button key={i} onClick={() => { setSelectedColor(i); setSelectedImage(0); setSelectedSize(cv.sizes?.[0]?.size || '') }}
                      title={cv.colorName}
                      className={`relative w-10 h-10 rounded-full border-4 transition-all ${i === selectedColor ? 'border-brand-red scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                      style={{ background: cv.colorHex }} />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {currentColorVariant?.sizes && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">Size: <span className="text-brand-red font-normal">{selectedSize}</span></p>
                  <Link href="/size-guide" className="text-xs text-brand-gold underline">Size Guide</Link>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {currentColorVariant.sizes.map((sv) => (
                    <button key={sv.size} onClick={() => setSelectedSize(sv.size)}
                      disabled={sv.stock === 0}
                      className={`min-w-[48px] h-12 px-3 border-2 text-sm font-medium transition-all
                        ${sv.stock === 0 ? 'border-gray-100 text-gray-300 cursor-not-allowed line-through' :
                          selectedSize === sv.size ? 'border-brand-red bg-brand-red text-white' :
                          'border-gray-200 hover:border-brand-red'}`}>
                      {sv.size}
                      {sv.price !== product.basePrice && <span className="block text-xs opacity-75">₹{sv.price}</span>}
                    </button>
                  ))}
                </div>
                {selectedSize && currentSizeVariant && currentSizeVariant.stock < 10 && currentSizeVariant.stock > 0 && (
                  <p className="text-orange-500 text-xs mt-2">⚡ Only {currentSizeVariant.stock} left!</p>
                )}
                {selectedSize && currentSizeVariant?.stock === 0 && (
                  <p className="text-red-500 text-xs mt-2">Out of stock in this size</p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <p className="text-sm font-semibold text-gray-700">Qty:</p>
              <div className="flex items-center border border-gray-200">
                <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <FiMinus size={14} />
                </button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => q+1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <FiPlus size={14} />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 mb-6">
              <button onClick={addToCart} disabled={!inStock}
                className="flex-1 btn-secondary flex items-center justify-center gap-2 disabled:opacity-50">
                <FiShoppingCart size={16} /> Add to Cart
              </button>
              <button onClick={buyNow} disabled={!inStock}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                Buy Now
              </button>
            </div>

            {/* Delivery info */}
            <div className="border border-gray-100 rounded-sm p-4 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <FiTruck className="text-brand-green flex-shrink-0" size={18} />
                <span>Free delivery on orders above ₹999. Estimated: 3-7 business days</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <FiRefreshCw className="text-brand-gold flex-shrink-0" size={18} />
                <span>Easy 7-day return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16 border-t border-gray-100">
          <div className="flex gap-8 border-b border-gray-100">
            {[['desc', 'Description'], ['details', 'Details'], ['reviews', `Reviews (${product.reviewCount})`]].map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab as 'desc' | 'details' | 'reviews')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'desc' && (
              <div className="prose max-w-none text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
            )}
            {activeTab === 'details' && (
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  ['Fabric', product.fabric], ['Occasion', product.occasion], ['Care', product.care],
                  ['Brand', 'SSRK Trending Collections'],
                  ['Available Sizes', product.availableSizes?.join(', ')],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex gap-4 py-3 border-b border-gray-50">
                    <span className="font-medium text-gray-700 w-36 flex-shrink-0">{k}</span>
                    <span className="text-gray-600">{v}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-gray-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                  <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
                    <FiStar size={14} /> Write a Review
                  </button>
                </div>

                {showReviewForm && (
                  <form onSubmit={submitReview} className="bg-brand-cream p-6 rounded-sm border border-gray-100 mb-8 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Your Name *</label>
                      <input required value={reviewForm.userName} onChange={e => setReviewForm(p => ({ ...p, userName: e.target.value }))}
                        placeholder="Enter your name" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Your Rating *</label>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} type="button" onClick={() => setReviewForm(p => ({ ...p, rating: s }))}>
                            <FiStar size={26} className={s <= reviewForm.rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-300'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Review Title</label>
                      <input value={reviewForm.title} onChange={e => setReviewForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="Summarize your experience" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Your Review *</label>
                      <textarea required rows={4} value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                        placeholder="Tell us what you think about this product..." className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Add Photos (optional, max 5)</label>
                      <div className="flex flex-wrap gap-2">
                        {reviewForm.images.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 rounded overflow-hidden group">
                            <Image src={img} alt="" fill className="object-cover" />
                            <button type="button" onClick={() => removeReviewImage(i)}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <FiX size={14} className="text-white" />
                            </button>
                          </div>
                        ))}
                        {reviewForm.images.length < 5 && (
                          <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-brand-red transition-colors">
                            {reviewUploading ? <span className="text-gray-400 text-xs">...</span> : <FiCamera size={18} className="text-gray-400" />}
                            <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleReviewImageUpload(e.target.files)} />
                          </label>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={reviewSubmitting} className="btn-primary px-8">
                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                      <button type="button" onClick={() => setShowReviewForm(false)} className="btn-secondary px-8">Cancel</button>
                    </div>
                  </form>
                )}

                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                ) : (
                  <div className="space-y-6">
                    {reviews.map(r => (
                      <div key={r._id} className="border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-brand-red/10 flex items-center justify-center">
                            <span className="text-brand-red font-bold text-sm">{r.userName[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm flex items-center gap-2">
                              {r.userName}
                              {r.isVerified && <span className="badge badge-info text-xs">Verified Purchase</span>}
                            </p>
                            <div className="flex items-center gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <FiStar key={s} size={12} className={s <= r.rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-300'} />
                              ))}
                            </div>
                          </div>
                          <span className="ml-auto text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        {r.title && <p className="font-medium text-sm mb-1">{r.title}</p>}
                        <p className="text-gray-600 text-sm">{r.comment}</p>
                        {r.images && r.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {r.images.map((img, i) => (
                              <div key={i} className="relative w-16 h-16 rounded overflow-hidden">
                                <Image src={img} alt="" fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  )
}
