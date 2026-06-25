'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  FiGrid, FiBox, FiList, FiShoppingBag, FiUsers, FiTag, FiImage,
  FiFilm, FiStar, FiBarChart2, FiPackage, FiMenu, FiX, FiLogOut, FiSettings
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: FiGrid },
  { label: 'Products', href: '/admin/products', icon: FiBox },
  { label: 'Categories', href: '/admin/categories', icon: FiList },
  { label: 'Orders', href: '/admin/orders', icon: FiShoppingBag },
  { label: 'Customers', href: '/admin/customers', icon: FiUsers },
  { label: 'Inventory', href: '/admin/inventory', icon: FiPackage },
  { label: 'Coupons', href: '/admin/coupons', icon: FiTag },
  { label: 'Banners', href: '/admin/banners', icon: FiImage },
  { label: 'Reels', href: '/admin/reels', icon: FiFilm },
  { label: 'Reviews', href: '/admin/reviews', icon: FiStar },
  { label: 'Reports', href: '/admin/reports', icon: FiBarChart2 },
  { label: 'Settings', href: '/admin/settings', icon: FiSettings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()).then(d => {
      if (!d.success || d.data.role !== 'admin') {
        router.push('/login')
      } else setAdmin(d.data)
    }).catch(() => router.push('/login'))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE', credentials: 'include' })
    localStorage.removeItem('token')
    toast.success('Logged out')
    router.push('/login')
  }

  if (!admin) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500 text-sm">Loading admin panel...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="font-bold text-lg tracking-tight text-red-600">SSRK Admin</p>
            <p className="text-gray-400 text-xs mt-0.5">Trending Collections</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <Icon size={17} className={isActive ? 'text-red-500' : 'text-gray-400'} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User / Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-sm shrink-0">
              {admin.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{admin.name}</p>
              <p className="text-xs text-gray-400 truncate">{admin.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all"
          >
            <FiLogOut size={17} className="text-gray-400" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiMenu size={20} />
          </button>
          <p className="font-bold text-red-600 tracking-tight">SSRK Admin</p>
          <div className="w-5" />
        </header>

        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}