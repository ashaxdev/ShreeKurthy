'use client'
import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(form),
      }).then(r => r.json())

      if (res.success) {
        localStorage.setItem('token', res.data.token)
        toast.success('Welcome back!')
        const role = res.data.user.role?.toLowerCase()
        window.location.href = role === 'admin' ? '/admin' : '/shop/account'
      } else toast.error(res.message)
    } catch { toast.error('Login failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream px-4">
      <div className="max-w-md w-full bg-white p-8 border border-gray-100 rounded-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-display text-3xl font-bold text-brand-red">SSRK</span>
            <p className="font-accent text-xs text-brand-gold tracking-[0.2em]">Trending Collections</p>
          </Link>
        </div>
        <h1 className="font-display text-2xl font-bold text-center mb-6">Welcome Back</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required className="input-field" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required className="input-field" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account? <Link href="/register" className="text-brand-red font-medium hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}