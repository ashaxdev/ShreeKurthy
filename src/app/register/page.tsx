'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(form),
      }).then(r => r.json())

      if (res.success) {
        localStorage.setItem('token', res.data.token)
        toast.success('Account created!')
        router.push('/shop/account')
      } else toast.error(res.message)
    } catch { toast.error('Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 border border-gray-100 rounded-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-display text-3xl font-bold text-brand-red">SSRK</span>
            <p className="font-accent text-xs text-brand-gold tracking-[0.2em]">Trending Collections</p>
          </Link>
        </div>
        <h1 className="font-display text-2xl font-bold text-center mb-6">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input required className="input-field" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required className="input-field" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input className="input-field" value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="10 digit number" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required minLength={6} className="input-field" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link href="/login" className="text-brand-red font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
