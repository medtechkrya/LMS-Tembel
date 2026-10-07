'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/mentor-logout', { method: 'POST' })
      router.push('/mentor-login')
      router.refresh()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[#6B5744] bg-white border border-[#E8D5B7]/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:text-[#2C1A0E] transition-all z-20"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        <span className="hidden sm:inline">Log Out</span>
      </button>

      {/* Subtle background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#F5A623]/10 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8D5B7]/20 rounded-full blur-3xl -z-10" />

      {/* Logo & title */}
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-lg mt-8 sm:mt-0">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 mb-10">
          <Image src="/Logo-Teman-Belajar.png" alt="Teman Belajar" width={160} height={160} className="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-sm hover:scale-105 transition-transform duration-500" />
          <div className="hidden sm:block w-px h-24 bg-gradient-to-b from-transparent via-[#E8D5B7] to-transparent rounded-full" />
          <div className="sm:hidden h-px w-24 bg-gradient-to-r from-transparent via-[#E8D5B7] to-transparent rounded-full" />
          <Image src="/krya-logo.png" alt="Krya" width={150} height={150} className="w-28 h-28 sm:w-[150px] sm:h-[150px] object-contain drop-shadow-sm hover:scale-105 transition-transform duration-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2C1A0E] tracking-tight mb-4 drop-shadow-sm">
          Teman Belajar
        </h1>
        <p className="text-base sm:text-lg text-[#6B5744] font-medium leading-relaxed px-4">
          Mentor Reporting & Session Management System
        </p>
      </div>

      {/* Nav buttons */}
      <div className="w-full max-w-md space-y-5 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
        <Link
          href="/sessions"
          className="group relative flex items-center p-5 bg-[#F5A623] text-[#2C1A0E] rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-1 hover:bg-[#F6AF3C] transition-all duration-300 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full transition-transform group-hover:scale-110" />
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-5 shrink-0 shadow-inner">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold tracking-wide mb-1">Recap Session</h2>
            <p className="text-sm font-medium text-[#2C1A0E]/80 leading-snug">
              Log student evaluation and attendance immediately after class.
            </p>
          </div>
          <div className="ml-4 shrink-0">
            <svg className="w-6 h-6 opacity-40 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </div>
        </Link>

        <Link
          href="/reports"
          className="group relative flex items-center p-5 bg-white text-[#2C1A0E] rounded-3xl border border-[#E8D5B7]/60 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#F5A623]/50 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FAFAF8] rounded-bl-full transition-transform group-hover:scale-110 -z-10" />
          <div className="w-14 h-14 bg-[#FAFAF8] rounded-2xl flex items-center justify-center mr-5 shrink-0 border border-[#E8D5B7]/40 group-hover:bg-[#FFF8EC] transition-colors">
            <svg className="w-7 h-7 text-[#F5A623]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold tracking-wide mb-1 group-hover:text-[#F5A623] transition-colors">Monthly Report</h2>
            <p className="text-sm font-medium text-[#8a7662] leading-snug">
              View and generate compiled PDF reports for students.
            </p>
          </div>
          <div className="ml-4 shrink-0">
            <svg className="w-6 h-6 opacity-30 text-[#6B5744] group-hover:text-[#F5A623] group-hover:opacity-100 group-hover:translate-x-1.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </div>
        </Link>
      </div>
    </div>
  )
}
