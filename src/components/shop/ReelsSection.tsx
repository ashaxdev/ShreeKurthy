'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiPlay, FiX, FiShoppingBag } from 'react-icons/fi'

interface Product { _id: string; name: string; slug: string; basePrice: number; images: string[] }
interface Reel { _id: string; title: string; videoUrl: string; thumbnail?: string; productIds: Product[] }

export default function ReelsSection() {
  const [reels, setReels] = useState<Reel[]>([])
  const [activeReel, setActiveReel] = useState<Reel | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    fetch('/api/reels').then(r => r.json()).then(d => { if (d.success) setReels(d.data) })
  }, [])

  if (reels.length === 0) return null

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-brand-gold font-accent text-sm tracking-[0.3em] mb-2">TRENDING</p>
          <h2 className="section-title">Shop by Reels</h2>
          <div className="gold-divider" />
          <p className="text-gray-500 mt-3">Swipe through our latest style reels</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {reels.map((reel) => (
            <div key={reel._id}
              className="relative flex-none w-44 md:w-52 aspect-[9/16] bg-gray-900 rounded-2xl overflow-hidden cursor-pointer snap-start group"
              onClick={() => setActiveReel(reel)}>
              {reel.thumbnail ? (
                <Image src={reel.thumbnail} alt={reel.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-brand-red/30 to-brand-dark" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-brand-red/80 transition-colors">
                  <FiPlay size={24} className="text-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white text-sm font-medium line-clamp-2">{reel.title}</p>
                {reel.productIds?.length > 0 && (
                  <p className="text-brand-gold-light text-xs mt-1 flex items-center gap-1">
                    <FiShoppingBag size={10} /> {reel.productIds.length} products
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {activeReel && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setActiveReel(null)}>
          <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveReel(null)} className="absolute -top-10 right-0 text-white hover:text-brand-gold">
              <FiX size={24} />
            </button>
            <div className="aspect-[9/16] bg-black rounded-2xl overflow-hidden">
              <video ref={videoRef} src={activeReel.videoUrl} autoPlay controls loop
                className="w-full h-full object-contain" />
            </div>
            {activeReel.productIds?.length > 0 && (
              <div className="mt-4">
                <p className="text-white font-medium mb-3">Featured Products</p>
                <div className="flex gap-3 overflow-x-auto">
                  {activeReel.productIds.map(p => (
                    <Link key={p._id} href={`/shop/products/${p.slug}`} onClick={() => setActiveReel(null)}
                      className="flex-none w-24 bg-white rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
                      <div className="relative h-24">
                        <Image src={p.images?.[0] || ''} alt={p.name} fill className="object-cover" />
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-800 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-brand-red font-bold">₹{p.basePrice}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
