'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MentorNav from '@/components/MentorNav'
import { getAvailablePeriods, getCurrentPeriod } from '@/lib/period'

interface Session {
  id: string
  date: string
  attendance: string
  activity: string
  photo_path: string | null
  student: { name: string }
  mentor: { name: string } | null
}

const ATTENDANCE_LABEL: Record<string, string> = {
  Present: 'Hadir', Absent: 'Tidak Hadir', Reschedule: 'Reschedule', hadir: 'Hadir',
}
const ATTENDANCE_BADGE: Record<string, string> = {
  Present: 'bg-green-100/80 text-green-700 ring-1 ring-green-600/10',
  Absent: 'bg-red-100/80 text-red-700 ring-1 ring-red-600/10',
  Reschedule: 'bg-yellow-100/80 text-yellow-800 ring-1 ring-yellow-600/10',
  hadir: 'bg-green-100/80 text-green-700 ring-1 ring-green-600/10',
}

function SessionCard({ session, showName }: { session: Session; showName: boolean }) {
  const badge = ATTENDANCE_BADGE[session.attendance] ?? 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/10'
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
    <div className="bg-white rounded-2xl shadow-sm border border-[#E8D5B7]/40 p-5 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-[#8a7662] uppercase leading-relaxed">{meta}</p>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${badge}`}>
          {label}
        </span>
      </div>
      {(session.attendance === 'Present' || session.attendance === 'hadir') && session.activity && (
        <p className="text-[#2C1A0E] mt-2.5 line-clamp-2 leading-relaxed text-[15px]">{session.activity}</p>
      )}
      {session.photo_path && (
        <div className="mt-3.5">
          <img
            src={session.photo_path}
            alt="Foto sesi"
            className="w-14 h-14 object-cover rounded-xl shadow-sm border border-black/5"
          />
        </div>
      )}
    </div>
  )
}

export default function SessionsPage() {
  const [allSessions, setAllSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const periods = getAvailablePeriods()
  const [selectedPeriodKey, setSelectedPeriodKey] = useState(getCurrentPeriod().key)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('success')) setShowSuccess(true)

    fetch('/api/sessions')
      .then(r => r.json())
      .then((data: Session[]) => {
        setAllSessions(data)
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedPeriod = periods.find(p => p.key === selectedPeriodKey) || periods[0]

  const sessions = allSessions.filter(s => {
    const d = new Date(s.date)
    return d >= selectedPeriod.start && d <= selectedPeriod.end
  })

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
    <div className="min-h-screen bg-[#FAFAF8] text-[#2C1A0E]">
      <MentorNav />

      <div className="max-w-xl mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#2C1A0E] tracking-tight">Session Recap</h1>
            <div className="mt-2 relative">
              <select
                value={selectedPeriodKey}
                onChange={e => {
                  setSelectedPeriodKey(e.target.value)
                  setSelectedStudent('')
                  setQuery('')
                }}
                className="appearance-none text-[13px] font-medium text-[#6B5744] bg-white border border-[#E8D5B7]/80 rounded-xl px-3 py-1.5 pr-8 outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] shadow-sm transition-all"
              >
                {periods.map(p => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#6B5744]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
          <Link
            href="/sessions/new"
            className="flex items-center gap-1.5 bg-[#F5A623] text-[#2C1A0E] text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow hover:-translate-y-0.5 hover:bg-[#F6AF3C] transition-all duration-200"
          >
            <span>Add Session</span>
          </Link>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50/50 backdrop-blur-sm border border-green-200/50 rounded-2xl text-sm font-medium text-green-700 shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">✓</div>
            Recap session saved successfully!
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6B5744]">
            <div className="w-8 h-8 border-2 border-[#E8D5B7] border-t-[#F5A623] rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20 px-6 bg-white border border-[#E8D5B7]/40 rounded-3xl shadow-sm">
            <div className="w-16 h-16 mx-auto bg-[#FAFAF8] rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#E8D5B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </div>
            <p className="text-[#2C1A0E] font-medium mb-1.5">No sessions yet</p>
            <p className="text-sm text-[#6B5744] mb-6">Belum ada sesi di periode ini.</p>
            <Link href="/sessions/new" className="inline-block text-sm font-semibold text-[#F5A623] hover:text-[#E09615] transition-colors">
              Add the first session →
            </Link>
          </div>
        ) : (
          <>
            {/* Student combobox */}
            <div className="relative mb-6 z-10">
              <div className="flex items-center border border-[#E8D5B7]/80 rounded-2xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#F5A623]/20 focus-within:border-[#F5A623] overflow-hidden transition-all duration-200 px-4 h-12">
                <svg className="w-4 h-4 text-[#B0957A] mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  value={query}
                  placeholder="Search student..."
                  className="flex-1 w-full text-[15px] font-medium text-[#2C1A0E] placeholder-[#B0957A] outline-none bg-transparent"
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
                    className="p-1 rounded-full hover:bg-gray-100 text-[#B0957A] hover:text-[#2C1A0E] transition-colors"
                    aria-label="Clear"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>

              {open && filteredNames.length > 0 && (
                <ul className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-xl border border-[#E8D5B7]/60 rounded-2xl shadow-lg overflow-y-auto max-h-[240px] py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  {filteredNames.map(name => (
                    <li
                      key={name}
                      onMouseDown={e => { e.preventDefault(); selectStudent(name) }}
                      className={`px-4 py-2.5 text-[15px] cursor-pointer transition-colors ${
                        selectedStudent === name
                          ? 'bg-[#F5A623]/10 text-[#2C1A0E] font-semibold'
                          : 'text-[#6B5744] hover:bg-[#FAFAF8] hover:text-[#2C1A0E] font-medium'
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
              <div className="space-y-4 animate-in fade-in duration-300">
                {selectedStudentSessions.map(session => (
                  <SessionCard key={session.id} session={session} showName={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-[15px] text-[#6B5744] font-medium">
                  Choose a student to see their recap.
                </p>
                <p className="text-sm text-[#B0957A] mt-1">Pilih siswa di kotak pencarian atas.</p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

