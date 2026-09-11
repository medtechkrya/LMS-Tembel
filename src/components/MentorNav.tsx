'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MentorNav() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Dashboard', short: 'Dashboard' },
    { href: '/sessions', label: 'Recap Session', short: 'Sessions' },
    { href: '/reports', label: 'Monthly Report', short: 'Reports' },
  ]

  return (
    <nav className="bg-white/70 backdrop-blur-xl border-b border-[#E8D5B7]/40 sticky top-0 z-50 shadow-[0_4px_20px_-10px_rgba(245,166,35,0.1)]">
      <div className="max-w-3xl mx-auto px-2 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 mr-auto group transition-transform hover:scale-[1.02] shrink-0">
          <img src="/Logo-Teman-Belajar.png" alt="Teman Belajar" className="h-6 sm:h-8 drop-shadow-sm" />
          <div className="w-px h-4 sm:h-5 bg-gradient-to-b from-transparent via-[#E8D5B7] to-transparent rounded-full" />
          <img src="/krya-logo.png" alt="Krya" className="h-5 sm:h-7 drop-shadow-sm" />
        </Link>

        {/* Links Area */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-[#FAFAF8] p-1 rounded-xl sm:rounded-2xl border border-[#E8D5B7]/50 shadow-inner shrink-0">
          {links.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-[13px] font-bold tracking-wide transition-all duration-300 text-center whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-[#F5A623] shadow-sm ring-1 ring-[#E8D5B7]/40'
                    : 'text-[#8a7662] hover:text-[#2C1A0E] hover:bg-white/50'
                }`}
              >
                <span className="hidden sm:inline">{link.label}</span>
                <span className="sm:hidden">{link.short}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
