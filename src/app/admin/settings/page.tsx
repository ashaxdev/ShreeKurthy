'use client'
import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import toast from 'react-hot-toast'
import { FiMapPin, FiPhone, FiMail, FiLock } from 'react-icons/fi'

export default function AdminSettingsPage() {
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match')
    toast('Password change endpoint can be wired up to /api/auth/change-password on request.', { icon: 'ℹ️' })
  }

  const input =
    'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition'
  const label = 'block text-xs font-medium uppercase tracking-wide text-gray-400 mb-1'

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage your store configuration</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">

        {/* Store Information */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-gray-900 font-semibold text-base mb-5">Store Information</h2>
          <div className="space-y-4">
            <div>
              <p className={label}>Store Name</p>
              <p className="text-gray-900 text-sm font-medium">SSRK Trending Collections</p>
            </div>
            <div className="flex items-start gap-2.5">
              <FiMapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className={label}>Address</p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  No.20 Vasantham Nagar, Thimmavaram,<br />Chengalpet – 603101
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <FiPhone size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className={label}>Phone</p>
                <p className="text-gray-700 text-sm">9994333728 / 9171070722</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <FiMail size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className={label}>Email</p>
                <p className="text-gray-700 text-sm">ss@ssrkcollections.com</p>
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-5 pt-5 border-t border-gray-100 leading-relaxed">
            To update store details shown across the site, edit the values in the footer/header components.
          </p>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <FiLock size={14} className="text-red-600" />
            </div>
            <h2 className="text-gray-900 font-semibold text-base">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className={label}>Current Password</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                className={input}
              />
            </div>
            <div>
              <label className={label}>New Password</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="Enter new password"
                className={input}
              />
            </div>
            <div>
              <label className={label}>Confirm New Password</label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Re-enter new password"
                className={input}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-2.5 text-sm font-semibold transition shadow-sm mt-1"
            >
              Update Password
            </button>
          </form>
        </div>

      </div>
    </AdminLayout>
  )
}