'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Login gagal')
        return
      }
      window.location.href = '/admin'
    } catch {
      setError('Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src="/Logo-Teman-Belajar.png" alt="Teman Belajar" className="h-14" />
            <img src="/krya-logo.png" alt="Krya" className="h-14" />
          </div>
          <p className="text-sm text-[#6B5744]">Admin Access</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E8D5B7] p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#2C1A0E] mb-1">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
              autoFocus
              className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2C1A0E] mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F5A623] text-[#2C1A0E] font-bold py-2.5 rounded-lg text-sm hover:bg-[#E09615] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>
        <p className="text-center mt-4">
          <Link href="/" className="text-sm text-[#6B5744] hover:text-[#2C1A0E] transition-colors">
            ← Kembali ke Dashboard
          </Link>
        </p>
      </div>
    </div>
  )
}
