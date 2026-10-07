'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F5A623]/5 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-6 mb-8">
            <img src="/Logo-Teman-Belajar.png" alt="Teman Belajar" className="h-16 drop-shadow-sm" />
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-[#E8D5B7] to-transparent rounded-full" />
            <img src="/krya-logo.png" alt="Krya" className="h-14 drop-shadow-sm" />
          </div>
          <h1 className="text-2xl font-bold text-[#2C1A0E] tracking-tight mb-2">Admin Access</h1>
          <p className="text-[14px] font-medium text-[#6B5744]">Log in to manage operations</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E8D5B7]/40 shadow-sm p-8 space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5A623]/5 rounded-bl-full -z-10" />

          {error && (
            <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl text-[13px] font-medium text-red-700 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold tracking-wider uppercase text-[#B0957A] mb-2">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
                autoFocus
                className="w-full bg-[#FAFAF8] border border-[#E8D5B7]/60 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-[#2C1A0E] tracking-wide focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] focus:bg-white transition-all text-center placeholder-[#E8D5B7]"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold tracking-wider uppercase text-[#B0957A] mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  className={`w-full bg-[#FAFAF8] border border-[#E8D5B7]/60 rounded-2xl px-4 py-3.5 ${showPassword ? 'text-[15px] font-bold tracking-wide' : 'text-[24px] font-bold tracking-[0.3em]'} text-[#2C1A0E] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] focus:bg-white transition-all text-center placeholder:tracking-normal placeholder-[#E8D5B7] placeholder:text-[15px]`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B0957A] hover:text-[#6B5744] transition-colors p-2"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F5A623] text-[#2C1A0E] font-bold py-4 rounded-2xl text-[15px] shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-[#F6AF3C] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm transition-all"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </div>
        </form>
        
        <p className="text-center mt-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[14px] font-bold text-[#8a7662] hover:text-[#2C1A0E] transition-colors bg-white/50 px-4 py-2 rounded-full border border-[#E8D5B7]/40 hover:bg-white hover:border-[#E8D5B7]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  )
}