'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ShopLayout from '@/components/layout/ShopLayout'
import ProductCard from '@/components/shop/ProductCard'
import ReelsSection from '@/components/shop/ReelsSection'
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiStar } from 'react-icons/fi'

interface Banner { _id: string; title: string; subtitle?: string; image: string; link?: string; buttonText?: string }
interface Category { _id: string; name: string; slug: string; image?: string }
interface Product { _id: string; name: string; slug: string; basePrice: number; mrp: number; images: string[]; averageRating: number; reviewCount: number; discount: number; isNewArrival: boolean; isBestSeller: boolean }

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [currentBanner, setCurrentBanner] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [b, c, f, na, bs] = await Promise.all([
          fetch('/api/banners').then(r => r.json()),
          fetch('/api/categories').then(r => r.json()),
          fetch('/api/products?featured=true&limit=8').then(r => r.json()),
          fetch('/api/products?newArrival=true&limit=8').then(r => r.json()),
          fetch('/api/products?bestSeller=true&limit=8').then(r => r.json()),
        ])
        if (b.success) setBanners(b.data)
        if (c.success) setCategories(c.data.slice(0, 8))
        if (f.success) setFeatured(f.data)
        if (na.success) setNewArrivals(na.data)
        if (bs.success) setBestSellers(bs.data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => setCurrentBanner(p => (p + 1) % banners.length), 4000)
      return () => clearInterval(interval)
    }
  }, [banners])

  return (
    <ShopLayout>
      {/* Hero Banner */}
      {/* Hero Banner */}
<section className="relative w-full aspect-[3/4] sm:aspect-[16/9] md:aspect-auto md:h-[85vh] overflow-hidden bg-brand-dark">
  {banners.length > 0 ? (
    banners.map((banner, i) => (
      <div
        key={banner._id}
        className={`absolute inset-0 transition-opacity duration-1000 ${i === currentBanner ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Blurred fill background so there are no empty bars when the image is letterboxed */}
        <Image
          src={banner.image}
          alt=""
          fill
          aria-hidden="true"
          className="object-cover scale-110 blur-2xl opacity-50"
        />

        {/* Actual image — fully visible, never cropped */}
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          className="object-contain md:object-cover"
          priority={i === 0}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/80 via-brand-dark/40 to-transparent md:block hidden" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/10 to-transparent md:hidden" />

        <div className="absolute inset-0 flex items-end md:items-center px-6 md:px-20 pb-10 md:pb-0">
          <div className="max-w-xl animate-fade-up">
            <p className="text-brand-gold font-accent text-base md:text-lg tracking-[0.2em] mb-2 md:mb-3">New Collection</p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-tight mb-3 md:mb-4">{banner.title}</h1>
            {banner.subtitle && <p className="text-gray-300 text-base md:text-lg mb-6 md:mb-8 font-light">{banner.subtitle}</p>}
            <Link href={banner.link || '/shop/products'} className="btn-gold inline-flex items-center gap-2">
              {banner.buttonText || 'Shop Now'} <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="absolute inset-0 bg-gradient-to-br from-brand-red-dark via-brand-red to-brand-gold flex items-center justify-center">
      <div className="text-center text-white px-8">
        <p className="font-accent text-xl tracking-[0.3em] text-brand-gold-light mb-4">WELCOME TO</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold mb-4">SSRK</h1>
        <p className="font-accent text-2xl text-brand-gold-light mb-8">Trending Collections</p>
        <Link href="/shop/products" className="inline-flex items-center gap-2 bg-white text-brand-red px-8 py-4 font-semibold tracking-wider hover:bg-brand-cream transition-colors">
          Explore Collection <FiArrowRight />
        </Link>
      </div>
    </div>
  )}
  {banners.length > 1 && (
    <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
      {banners.map((_, i) => (
        <button key={i} onClick={() => setCurrentBanner(i)}
          className={`w-2 h-2 rounded-full transition-all ${i === currentBanner ? 'bg-brand-gold w-6' : 'bg-white/50'}`} />
      ))}
    </div>
  )}
</section>

      {/* Trust badges */}
      <section className="border-y border-gray-100 bg-brand-cream">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: FiTruck, title: 'Free Delivery', desc: 'On orders above ₹999' },
            { icon: FiShield, title: 'Secure Payment', desc: 'Razorpay & COD' },
            { icon: FiRefreshCw, title: 'Easy Returns', desc: '7 day return policy' },
            { icon: FiStar, title: 'Quality Assured', desc: 'Premium collections' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                <Icon className="text-brand-red" size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm text-brand-dark">{title}</p>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      {categories.length > 0 && (
        <section className="py-16 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-brand-gold font-accent text-sm tracking-[0.3em] mb-2">EXPLORE</p>
            <h2 className="section-title">Shop by Category</h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat._id} href={`/shop/category/${cat.slug}`}
                className="group relative aspect-square overflow-hidden bg-gray-100 rounded-sm cursor-pointer">
                {cat.image ? (
                  <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-red/20 to-brand-gold/20 flex items-center justify-center">
                    <span className="font-display text-4xl text-brand-red/30">{cat.name[0]}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-display text-white font-semibold text-lg">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-16 px-4 bg-brand-cream">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-brand-gold font-accent text-sm tracking-[0.3em] mb-2">HANDPICKED</p>
              <h2 className="section-title">Featured Collection</h2>
              <div className="gold-divider" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
            <div className="text-center mt-10">
              <Link href="/shop/products?featured=true" className="btn-secondary inline-flex items-center gap-2">
                View All Featured <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="py-20 bg-brand-gradient text-white text-center px-4"
        style={{ background: 'linear-gradient(135deg, #5C0000 0%, #8B1A1A 50%, #C9A84C 100%)' }}>
        <p className="font-accent text-xl text-brand-gold-light tracking-widest mb-3">EXCLUSIVE OFFER</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Flat 20% Off on First Order</h2>
        <p className="text-gray-300 mb-8 text-lg">Use code <span className="font-bold text-brand-gold-light">WELCOME20</span> at checkout</p>
        <Link href="/shop/products" className="inline-flex items-center gap-2 bg-white text-brand-red px-8 py-4 font-semibold tracking-wider hover:bg-brand-cream transition-colors">
          Shop Now <FiArrowRight />
        </Link>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-16 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-brand-gold font-accent text-sm tracking-[0.3em] mb-2">FRESH DROPS</p>
            <h2 className="section-title">New Arrivals</h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
          <div className="text-center mt-10">
            <Link href="/shop/products?newArrival=true" className="btn-primary inline-flex items-center gap-2">
              Explore New Arrivals <FiArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* Shop by Reels */}
      <ReelsSection />

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-16 px-4 bg-brand-cream">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-brand-gold font-accent text-sm tracking-[0.3em] mb-2">MOST LOVED</p>
              <h2 className="section-title">Best Sellers</h2>
              <div className="gold-divider" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bestSellers.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Store Info */}
      <section className="py-16 px-4 bg-brand-dark text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="gold-text font-display text-3xl font-bold mb-4">Visit Our Store</p>
          <div className="gold-divider" />
          <p className="text-gray-300 mt-6 text-lg">No.20 Vasantham Nagar, Thimmavaram</p>
          <p className="text-gray-300 text-lg">Chengalpet - 603101</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <a href="tel:9994333728" className="text-brand-gold hover:text-brand-gold-light transition-colors text-lg">📞 9994333728</a>
            <a href="tel:9171070722" className="text-brand-gold hover:text-brand-gold-light transition-colors text-lg">📞 9171070722</a>
            <a href="mailto:ss@ssrkcollections.com" className="text-brand-gold hover:text-brand-gold-light transition-colors text-lg">✉️ ss@ssrkcollections.com</a>
          </div>
        </div>
      </section>
    </ShopLayout>
  )
}
