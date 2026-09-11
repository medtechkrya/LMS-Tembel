'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/students', label: 'Students' },
  { href: '/admin/mentors', label: 'Mentors' },
  { href: '/admin/sessions', label: 'Sessions' },
  { href: '/admin/reports', label: 'Reports' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <aside className="w-full md:w-56 shrink-0 bg-white/80 backdrop-blur-md border-b md:border-b-0 md:border-r border-[#E8D5B7]/50 md:min-h-screen flex flex-col md:py-8 px-5 py-4 relative z-20">
      <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start gap-3 md:mb-10 w-full">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 md:px-2">
            <img src="/Logo-Teman-Belajar.png" alt="Teman Belajar" className="h-6 md:h-8 object-contain" />
            <div className="w-px h-4 md:h-5 bg-[#E8D5B7]/60 rounded-full" />
            <img src="/krya-logo.png" alt="Krya" className="h-5 md:h-7 object-contain" />
          </div>
          <p className="hidden md:block px-2 text-[11px] font-bold tracking-widest uppercase text-[#B0957A]">Admin Panel</p>
        </div>
        <button
          onClick={handleLogout}
          className="md:hidden px-3 py-1.5 rounded-lg text-[12px] font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          Logout
        </button>
      </div>
      
      {/* Mobile Links (Wrap) */}
      <nav className="flex md:hidden flex-wrap justify-center gap-2 py-3 -mx-2 px-2">
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${
                active
                  ? 'bg-[#F5A623]/10 text-[#F5A623] font-bold shadow-sm ring-1 ring-[#F5A623]/20'
                  : 'text-[#6B5744] bg-[#FAFAF8] border border-[#E8D5B7]/40'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Desktop Links (Vertical) */}
      <nav className="hidden md:flex flex-col gap-1.5 flex-1">
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 ${
                active
                  ? 'bg-[#F5A623]/10 text-[#F5A623] font-bold shadow-sm ring-1 ring-[#F5A623]/20'
                  : 'text-[#6B5744] hover:bg-[#FAFAF8] hover:text-[#2C1A0E] hover:translate-x-1'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      
      <button
        onClick={handleLogout}
        className="hidden md:block px-4 py-2.5 rounded-xl text-[14px] font-medium text-red-600/80 hover:bg-red-50 hover:text-red-700 text-left transition-all mt-4"
      >
        Logout
      </button>
    </aside>
  )
}
