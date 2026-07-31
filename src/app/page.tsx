'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-6">

      {/* Logo & title */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Image src="/Logo-Teman-Belajar.png" alt="Teman Belajar" width={160} height={160} />
          <Image src="/krya-logo.png" alt="Krya" width={160} height={160} />
        </div>
        <p className="text-sm text-[#6B5744]">Sistem Rekap Sesi & Laporan Mentor</p>
      </div>

      {/* Nav buttons */}
      <div className="w-full max-w-xs space-y-4">
        <Link
          href="/sessions"
          className="flex items-center justify-center w-full bg-[#F5A623] text-[#2C1A0E] text-base font-bold py-4 rounded-2xl hover:bg-[#E09615] active:scale-95 transition-all"
        >
          Rekap Sesi
        </Link>
        <Link
          href="/reports"
          className="flex items-center justify-center w-full bg-white text-[#F5A623] text-base font-bold py-4 rounded-2xl border border-[#F5A623] hover:bg-[#FFF8EC] active:scale-95 transition-all"
        >
          Laporan Bulanan
        </Link>
      </div>

      {/* Admin link */}
      <div className="absolute bottom-8">
        <Link href="/admin" className="text-xs text-[#6B5744] hover:text-[#2C1A0E] transition-colors">
          Admin
        </Link>
      </div>

    </div>
  )
}
