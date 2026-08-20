'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Session {
  id: string
  date: string
  attendance: string
  activity: string
  photo_path: string | null
  student: { name: string }
  mentor: { name: string } | null
}

function getCurrentPeriod(): { start: Date; end: Date } {
  const now = new Date()
  const day = now.getDate()
  if (day >= 26) {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 26),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 25, 23, 59, 59, 999),
    }
  }
  return {
    start: new Date(now.getFullYear(), now.getMonth() - 1, 26),
    end: new Date(now.getFullYear(), now.getMonth(), 25, 23, 59, 59, 999),
  }
}

function formatPeriod(start: Date, end: Date): string {
  const s = start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  const e = end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${s} – ${e}`
}

const ATTENDANCE_LABEL: Record<string, string> = {
  Present: 'Hadir', Absent: 'Tidak Hadir', Reschedule: 'Reschedule', hadir: 'Hadir',
}
const ATTENDANCE_BADGE: Record<string, string> = {
  Present: 'bg-green-100 text-green-700',
  Absent: 'bg-red-100 text-red-700',
  Reschedule: 'bg-yellow-100 text-yellow-700',
  hadir: 'bg-green-100 text-green-700',
}

function SessionCard({ session, showName }: { session: Session; showName: boolean }) {
  const badge = ATTENDANCE_BADGE[session.attendance] ?? 'bg-gray-100 text-gray-600'
  const label = ATTENDANCE_LABEL[session.attendance] ?? session.attendance
  const date = new Date(session.date).toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })

  const meta = [
    showName ? session.student.name : null,
    date,
    session.mentor ? session.mentor.name : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="bg-white rounded-lg border border-[#E8D5B7] px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-[#6B5744] leading-relaxed">{meta}</p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${badge}`}>
          {label}
        </span>
      </div>
      {(session.attendance === 'Present' || session.attendance === 'hadir') && session.activity && (
        <p className="text-sm text-[#2C1A0E] mt-1.5 line-clamp-2">{session.activity}</p>
      )}
      {session.photo_path && (
        <div className="mt-2">
          <img
            src={session.photo_path}
            alt="Foto sesi"
            className="w-10 h-10 object-cover rounded"
          />
        </div>
      )}
    </div>
  )
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const period = getCurrentPeriod()

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('success')) setShowSuccess(true)

    fetch('/api/sessions')
      .then(r => r.json())
      .then((data: Session[]) => {
        const filtered = data.filter(s => {
          const d = new Date(s.date)
          return d >= period.start && d <= period.end
        })
        setSessions(filtered)
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const studentNames = Array.from(new Set(sessions.map(s => s.student.name))).sort()
  const filteredNames = studentNames.filter(n =>
    n.toLowerCase().includes(query.toLowerCase())
  )
  const selectedStudentSessions = sessions.filter(s => s.student.name === selectedStudent)

  function selectStudent(name: string) {
    setSelectedStudent(name)
    setQuery(name)
    setOpen(false)
  }

  function clearStudent() {
    setSelectedStudent('')
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Nav */}
      <nav className="bg-white border-b-2 border-[#E8D5B7] sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 flex items-center gap-6 h-12">
          <div className="flex items-center gap-2 mr-auto">
            <img src="/Logo-Teman-Belajar.png" alt="Teman Belajar" className="h-7" />
            <img src="/krya-logo.png" alt="Krya" className="h-7" />
          </div>
          <Link href="/" className="text-sm text-[#2C1A0E]/60 hover:text-[#2C1A0E] transition-colors">Dashboard</Link>
          <Link href="/sessions" className="text-sm font-semibold text-[#F5A623]">Sesi</Link>
          <Link href="/reports" className="text-sm text-[#2C1A0E]/60 hover:text-[#2C1A0E] transition-colors">Laporan</Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-[#2C1A0E]">Session Recap</h1>
            <p className="text-sm text-[#6B5744] mt-0.5">{formatPeriod(period.start, period.end)}</p>
          </div>
          <Link
            href="/sessions/new"
            className="bg-[#F5A623] text-[#2C1A0E] text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#E09615] transition-colors"
          >
            + Tambah
          </Link>
        </div>

        {showSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            Rekap sesi berhasil disimpan!
          </div>
        )}

        {loading ? (
          <p className="text-sm text-[#6B5744] py-8 text-center">Memuat...</p>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 text-[#6B5744] text-sm">
            <p className="mb-2">Belum ada sesi dalam periode ini.</p>
            <Link href="/sessions/new" className="text-[#F5A623] hover:underline">
              Tambah sesi pertama
            </Link>
          </div>
        ) : (
          <>
            {/* Student combobox */}
            <div className="relative mb-5">
              <div className="flex items-center border border-[#E8D5B7] rounded-lg bg-white overflow-hidden">
                <input
                  type="text"
                  value={query}
                  placeholder="Search Student..."
                  className="flex-1 px-3 py-2 text-sm text-[#2C1A0E] placeholder-[#B0957A] outline-none bg-transparent"
                  onChange={e => {
                    setQuery(e.target.value)
                    setSelectedStudent('')
                    setOpen(true)
                  }}
                  onFocus={() => {
                    if (selectedStudent) {
                      setQuery('')
                      setSelectedStudent('')
                    }
                    setOpen(true)
                  }}
                  onBlur={() => setTimeout(() => setOpen(false), 150)}
                />
                {query && (
                  <button
                    onMouseDown={e => { e.preventDefault(); clearStudent() }}
                    className="px-3 text-[#B0957A] hover:text-[#2C1A0E] text-lg leading-none"
                    aria-label="Clear"
                  >
                    ×
                  </button>
                )}
              </div>

              {open && filteredNames.length > 0 && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-[#E8D5B7] rounded-lg shadow-md overflow-y-auto max-h-[200px]">
                  {filteredNames.map(name => (
                    <li
                      key={name}
                      onMouseDown={e => { e.preventDefault(); selectStudent(name) }}
                      className={`px-3 py-2 text-sm cursor-pointer ${
                        selectedStudent === name
                          ? 'bg-[#F5A623] text-[#2C1A0E] font-medium'
                          : 'text-[#2C1A0E] hover:bg-[#FFF3CD]'
                      }`}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Sessions */}
            {selectedStudent ? (
              <div className="space-y-2">
                {selectedStudentSessions.map(session => (
                  <SessionCard key={session.id} session={session} showName={false} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6B5744] text-center py-12">
                Pilih siswa untuk melihat sesinya.
              </p>
            )}
          </>
        )}

      </div>
    </div>
  )
}
