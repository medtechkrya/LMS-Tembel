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
    <aside className="w-48 shrink-0 bg-white border-r-2 border-[#E8D5B7] min-h-screen flex flex-col py-6 px-4">
      <div className="flex items-center gap-2 mb-6">
        <img src="/Logo-Teman-Belajar.png" alt="Teman Belajar" className="h-8" />
        <img src="/krya-logo.png" alt="Krya" className="h-8" />
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#FFF3CD] text-[#F5A623] font-bold'
                  : 'text-[#2C1A0E]/70 hover:bg-[#FAFAF8] hover:text-[#2C1A0E]'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      <button
        onClick={handleLogout}
        className="px-3 py-2 rounded-lg text-sm text-[#6B5744] hover:bg-[#FAFAF8] hover:text-[#2C1A0E] text-left transition-colors"
      >
        Logout
      </button>
    </aside>
  )
}
