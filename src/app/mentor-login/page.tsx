'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MentorLoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/mentor-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      if (res.ok) {
        router.push('/sessions')
      } else {
        const data = await res.json()
        setError(data.error || 'Incorrect PIN. Please try again / PIN Salah. Silakan coba lagi.')
      }
    } catch {
      setError('System error. Please try again later / Terjadi kesalahan sistem. Silakan coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-5">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-[#E8D5B7]/40 w-full max-w-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5A623]/5 rounded-bl-full -z-10" />
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-[#FAFAF8] rounded-2xl flex items-center justify-center mb-5 border border-[#E8D5B7]/40">
            <svg className="w-8 h-8 text-[#F5A623]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-[#2C1A0E] mb-2 tracking-tight">Mentor Access</h1>
          <p className="text-[13px] text-[#6B5744] leading-relaxed">
            Enter the mentor PIN to access the reporting system.<br/>
            <span className="text-[#B0957A]">Masukkan PIN mentor untuk masuk ke sistem pelaporan.</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[13px] font-semibold text-[#2C1A0E] mb-2 text-center uppercase tracking-wide">
              Enter PIN / Masukkan PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-3xl tracking-[0.5em] border border-[#E8D5B7]/60 rounded-2xl px-4 py-4 bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] focus:bg-white transition-all text-[#2C1A0E]"
              placeholder="••••••"
              maxLength={6}
              required
            />
          </div>

          {error && (
            <div className="text-[13px] font-medium text-red-700 bg-red-50/50 backdrop-blur-sm border border-red-200/50 p-3 rounded-xl text-center animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || pin.length < 4}
            className="w-full bg-[#F5A623] text-[#2C1A0E] text-[15px] font-bold py-3.5 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-[#F6AF3C] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? 'Checking... / Memeriksa...' : 'Enter / Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
