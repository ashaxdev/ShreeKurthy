'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ShopLayout from '@/components/layout/ShopLayout'
import ProductCard from '@/components/shop/ProductCard'
import { FiFilter, FiX, FiChevronDown, FiSearch } from 'react-icons/fi'

interface Product {
  _id: string; name: string; slug: string; basePrice: number; mrp: number
  images: string[]; averageRating: number; reviewCount: number; discount: number
  isNewArrival: boolean; isBestSeller: boolean
  colorVariants?: { colorName: string; colorHex: string; images: string[] }[]
}
interface Category { _id: string; name: string; slug: string }

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size', '28', '30', '32', '34', '36', '38', '40', '42', '44']
const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'basePrice-asc', label: 'Price: Low to High' },
  { value: 'basePrice-desc', label: 'Price: High to Low' },
  { value: 'averageRating-desc', label: 'Top Rated' },
  { value: 'totalSold-desc', label: 'Most Popular' },
]

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    size: searchParams.get('size') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: 'createdAt',
    order: 'desc',
    search: searchParams.get('search') || '',
    featured: searchParams.get('featured') || '',
    newArrival: searchParams.get('newArrival') || '',
    bestSeller: searchParams.get('bestSeller') || '',
  })

  const limit = 16

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })

      const res = await fetch(`/api/products?${params}`).then(r => r.json())
      if (res.success) {
        setProducts(page === 1 ? res.data : prev => [...prev, ...res.data])
        setTotal(res.pagination.total)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [filters, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => { if (d.success) setCategories(d.data) })
  }, [])

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
    setProducts([])
  }

  const clearFilters = () => {
    setFilters({ category: '', size: '', minPrice: '', maxPrice: '', sort: 'createdAt', order: 'desc', search: '', featured: '', newArrival: '', bestSeller: '' })
    setPage(1)
    setProducts([])
  }

  const sortChange = (v: string) => {
    const [sort, order] = v.split('-')
    setFilters(prev => ({ ...prev, sort, order }))
    setPage(1)
    setProducts([])
  }

  const pageTitle = filters.newArrival ? 'New Arrivals' : filters.bestSeller ? 'Best Sellers' : filters.featured ? 'Featured Products' : filters.search ? `Search: "${filters.search}"` : 'All Products'

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Search</h3>
        <div className="relative">
          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search..." value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            className="input-field pl-9 py-2" />
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Category</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="cat" checked={!filters.category} onChange={() => updateFilter('category', '')} className="accent-brand-red" />
            <span className="text-sm">All Categories</span>
          </label>
          {categories.map(cat => (
            <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="cat" checked={filters.category === cat._id} onChange={() => updateFilter('category', cat._id)} className="accent-brand-red" />
              <span className="text-sm">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(sz => (
            <button key={sz} onClick={() => updateFilter('size', filters.size === sz ? '' : sz)}
              className={`px-3 py-1.5 text-xs border transition-all ${filters.size === sz ? 'bg-brand-red text-white border-brand-red' : 'border-gray-200 hover:border-brand-red'}`}>
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Price Range</h3>
        <div className="flex gap-2 items-center">
          <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)}
            className="input-field py-2 w-24 text-sm" />
          <span className="text-gray-400">—</span>
          <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)}
            className="input-field py-2 w-24 text-sm" />
        </div>
      </div>

      <button onClick={clearFilters} className="text-xs text-brand-red underline">Clear all filters</button>
    </div>
  )

  return (
    <ShopLayout>
      {/* Header */}
      <div className="bg-brand-cream border-b border-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-brand-dark">{pageTitle}</h1>
          <p className="text-gray-500 text-sm mt-1">{total} products found</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <button onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 text-sm font-medium border border-gray-200 px-4 py-2 hover:border-brand-red transition-colors md:hidden">
            <FiFilter size={16} /> Filters
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-gray-500 hidden md:block">Sort by:</span>
            <select onChange={e => sortChange(e.target.value)} value={`${filters.sort}-${filters.order}`}
              className="input-field py-2 pr-8 text-sm w-auto cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-64 flex-shrink-0 sticky top-24 self-start">
            <FilterPanel />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {loading && products.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="skeleton aspect-[3/4] rounded-sm" />
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-6xl mb-4">🔍</p>
                <p className="text-gray-500 mb-4">No products found</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
                {products.length < total && (
                  <div className="text-center mt-10">
                    <button onClick={() => setPage(p => p + 1)} disabled={loading}
                      className="btn-secondary px-12">
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)}><FiX size={20} /></button>
            </div>
            <div className="p-4"><FilterPanel /></div>
          </div>
        </div>
      )}
    </ShopLayout>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <ShopLayout>
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4] rounded-sm" />)}
          </div>
        </div>
      </ShopLayout>
    }>
      <ProductsPageContent />
    </Suspense>
  )
}
