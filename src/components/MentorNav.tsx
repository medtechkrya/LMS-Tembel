'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface LoggedInMentor {
  id: string
  name: string
  photo_path?: string | null
}

export default function MentorNav() {
  const pathname = usePathname()
  const [mentor, setMentor] = useState<LoggedInMentor | null>(null)

  useEffect(() => {
    fetch('/api/mentor-me')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.id) setMentor(data)
      })
      .catch(() => {})
  }, [])

  const links = [
    { href: '/', label: 'Dashboard', short: 'Home' },
    { href: '/sessions', label: 'Recap Session', short: 'Sessions' },
    { href: '/reports', label: 'Monthly Report', short: 'Reports' },
  ]

  return (
    <nav className="bg-white/70 backdrop-blur-xl border-b border-[#E8D5B7]/40 sticky top-0 z-50 shadow-[0_4px_20px_-10px_rgba(245,166,35,0.1)]">
      <div className="max-w-3xl mx-auto px-2.5 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 mr-auto group transition-transform hover:scale-[1.02] shrink-0">
          <img src="/Logo-Teman-Belajar.png" alt="Teman Belajar" className="h-6 sm:h-8 drop-shadow-sm" />
          <div className="hidden sm:block w-px h-5 bg-gradient-to-b from-transparent via-[#E8D5B7] to-transparent rounded-full" />
          <img src="/krya-logo.png" alt="Krya" className="hidden sm:block h-7 drop-shadow-sm" />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* Links Area */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-[#FAFAF8] p-1 rounded-xl sm:rounded-2xl border border-[#E8D5B7]/50 shadow-inner shrink-0">
            {links.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-2 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-[13px] font-bold tracking-wide transition-all duration-300 text-center whitespace-nowrap ${
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

          {/* Logged-in Mentor Badge */}
          {mentor && (
            <div
              className="flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5 rounded-xl bg-[#FAFAF8] border border-[#E8D5B7]/60 text-[#2C1A0E] max-w-[88px] sm:max-w-[160px]"
              title={`Logged in as ${mentor.name}`}
            >
              {mentor.photo_path ? (
                <img
                  src={mentor.photo_path}
                  alt={mentor.name}
                  className="w-5 h-5 rounded-full object-cover border border-[#E8D5B7] shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#F5A623]/20 text-[#2C1A0E] text-[10px] font-bold flex items-center justify-center shrink-0">
                  {mentor.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[11px] sm:text-[12px] font-semibold truncate">
                <span className="sm:hidden">{mentor.name.split(' ')[0]}</span>
                <span className="hidden sm:inline">{mentor.name}</span>
              </span>
            </div>
          )}

          <button 
            onClick={async () => {
              await fetch('/api/mentor-logout', { method: 'POST' })
              window.location.href = '/mentor-login'
            }}
            title="Log Out"
            className="p-1.5 sm:p-2 rounded-xl text-[#8a7662] hover:text-[#2C1A0E] hover:bg-[#FAFAF8] border border-transparent hover:border-[#E8D5B7]/50 transition-all shrink-0"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
