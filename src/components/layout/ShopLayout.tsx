'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiHeart, FiChevronDown, FiPackage } from 'react-icons/fi'

interface CartItem { quantity: number }

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[]
    setCartCount(cart.reduce((s: number, i: CartItem) => s + i.quantity, 0))
    const wl = JSON.parse(localStorage.getItem('wishlist') || '[]') as string[]
    setWishlistCount(wl.length)

    const token = document.cookie.includes('token') || localStorage.getItem('token')
    if (token) {
      fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.success) setUser(d.data) }).catch(() => {})
    }
  }, [pathname])

  useEffect(() => {
    if (isSearchOpen) searchRef.current?.focus()
  }, [isSearchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop/products?search=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'All Products', href: '/shop/products' },
    { label: 'New Arrivals', href: '/shop/products?newArrival=true' },
    { label: 'Best Sellers', href: '/shop/products?bestSeller=true' },
    { label: 'Sale', href: '/shop/products?sale=true' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-brand-red text-white text-center py-2 text-xs font-medium tracking-widest">
        FREE SHIPPING ON ORDERS ABOVE ₹999 | USE CODE <span className="font-bold text-brand-gold-light">WELCOME20</span> FOR 20% OFF
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 bg-white transition-all duration-300 ${scrolled ? 'header-shadow' : 'border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex flex-col">
              <span className="font-display text-2xl md:text-3xl font-bold text-brand-red leading-none">SSRK</span>
              <span className="font-accent text-xs text-brand-gold tracking-[0.2em]">Trending Collections</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={`text-sm font-medium tracking-wide hover:text-brand-red transition-colors ${pathname === link.href ? 'text-brand-red' : 'text-gray-700'}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSearchOpen(true)} className="w-9 h-9 flex items-center justify-center hover:text-brand-red transition-colors">
              <FiSearch size={20} />
            </button>

            <Link href="/shop/wishlist" className="w-9 h-9 flex items-center justify-center hover:text-brand-red transition-colors relative">
              <FiHeart size={20} />
              {wishlistCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-gold text-white text-xs rounded-full flex items-center justify-center">{wishlistCount}</span>}
            </Link>

            <Link href="/shop/cart" className="w-9 h-9 flex items-center justify-center hover:text-brand-red transition-colors relative">
              <FiShoppingCart size={20} />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-red text-white text-xs rounded-full flex items-center justify-center">{cartCount}</span>}
            </Link>

            <Link href="/track-order" className="hidden md:flex w-9 h-9 items-center justify-center hover:text-brand-red transition-colors" title="Track Order">
              <FiPackage size={20} />
            </Link>

            <Link href={user ? '/shop/account' : '/login'} className="hidden md:flex items-center gap-1.5 btn-primary py-2 px-4 text-sm">
              <FiUser size={16} />
              <span>{user ? user.name.split(' ')[0] : 'Login'}</span>
            </Link>

            <button onClick={() => setIsMenuOpen(true)} className="md:hidden w-9 h-9 flex items-center justify-center">
              <FiMenu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white animate-slide-in flex flex-col">
            <div className="flex items-center justify-between p-5 border-b">
              <span className="font-display text-xl font-bold text-brand-red">SSRK</span>
              <button onClick={() => setIsMenuOpen(false)}><FiX size={22} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-1">
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}
                    className="block py-3 px-4 text-gray-700 hover:text-brand-red hover:bg-brand-cream rounded-lg transition-colors font-medium">
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t space-y-3">
                <Link href={user ? '/shop/account' : '/login'} onClick={() => setIsMenuOpen(false)} className="btn-primary w-full text-center block">
                  {user ? 'My Account' : 'Login / Register'}
                </Link>
                <Link href="/track-order" onClick={() => setIsMenuOpen(false)} className="btn-secondary w-full text-center block">
                  Track Order
                </Link>
                <Link href="/shop/cart" onClick={() => setIsMenuOpen(false)} className="btn-secondary w-full text-center block">
                  Cart ({cartCount})
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-20 px-4">
          <div className="bg-white w-full max-w-2xl rounded-sm p-4">
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <FiSearch size={20} className="text-gray-400 flex-shrink-0" />
              <input ref={searchRef} type="text" placeholder="Search products..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 text-lg outline-none" />
              <button type="button" onClick={() => setIsSearchOpen(false)}><FiX size={20} /></button>
            </form>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-brand-dark text-white pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="mb-4">
              <span className="font-display text-3xl font-bold text-brand-red">SSRK</span>
              <span className="font-accent text-sm text-brand-gold ml-2">Trending Collections</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Your trusted boutique for premium ethnic and trendy fashion. Quality collections for every occasion.
            </p>
            <p className="text-gray-400 text-sm">No.20 Vasantham Nagar, Thimmavaram<br />Chengalpet - 603101</p>
            <div className="mt-4 space-y-1">
              <a href="tel:9994333728" className="block text-brand-gold hover:text-brand-gold-light text-sm">📞 9994333728</a>
              <a href="tel:9171070722" className="block text-brand-gold hover:text-brand-gold-light text-sm">📞 9171070722</a>
              <a href="mailto:ss@ssrkcollections.com" className="block text-brand-gold hover:text-brand-gold-light text-sm">✉️ ss@ssrkcollections.com</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 tracking-wider text-sm">QUICK LINKS</h4>
            <div className="space-y-2">
              {[['All Products', '/shop/products'], ['New Arrivals', '/shop/products?newArrival=true'], ['Best Sellers', '/shop/products?bestSeller=true'], ['Track Order', '/track-order'], ['My Orders', '/shop/orders'], ['My Account', '/shop/account']].map(([label, href]) => (
                <Link key={href} href={href} className="block text-gray-400 hover:text-white transition-colors text-sm">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 tracking-wider text-sm">POLICIES</h4>
            <div className="space-y-2">
              {[['Privacy Policy', '/privacy'], ['Return Policy', '/returns'], ['Shipping Policy', '/shipping'], ['Terms of Service', '/terms'], ['Contact Us', '/contact']].map(([label, href]) => (
                <Link key={href} href={href} className="block text-gray-400 hover:text-white transition-colors text-sm">{label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">© 2024 SSRK Trending Collections. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
