'use client'

import { useEffect, useState } from 'react'
import AdminNav from '../_nav'

interface Session {
  id: string
  student_id: string
  date: string
  attendance: string
  activity: string
  photo_path: string | null
  mentor: { name: string } | null
}

interface Student {
  id: string
  name: string
  program: string
}

const ATTENDANCE_LABEL: Record<string, string> = {
  Present: 'Hadir',
  Absent: 'Tidak Hadir',
  Reschedule: 'Reschedule',
  hadir: 'Hadir',
}

const ATTENDANCE_BADGE: Record<string, string> = {
  Present: 'bg-green-100 text-green-700',
  Absent: 'bg-red-100 text-red-700',
  Reschedule: 'bg-yellow-100 text-yellow-700',
  hadir: 'bg-green-100 text-green-700',
}

import { getAvailablePeriods, getCurrentPeriod, getPeriodKeyFromDate } from '@/lib/period'

function formatPeriodLabel(key: string): string {
  const period = getAvailablePeriods(12).find(p => p.key === key)
  if (period) return period.label
  return key
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function AdminSessionsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)

  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [studentSessions, setStudentSessions] = useState<Session[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('')

  const [error, setError] = useState('')
  const [hasDownloaded, setHasDownloaded] = useState(false)
  const [downloadingPhotos, setDownloadingPhotos] = useState(false)
  const [deletingPhotos, setDeletingPhotos] = useState(false)

  useEffect(() => {
    fetch('/api/students')
      .then(r => r.json())
      .then(setStudents)
      .catch(() => setError('Failed to load students'))
      .finally(() => setLoadingStudents(false))
  }, [])

  // When student changes: fetch their sessions, compute periods, default to current
  const handleStudentChange = async (studentId: string) => {
    setSelectedStudentId(studentId)
    setSelectedPeriod('')
    setStudentSessions([])
    setAvailablePeriods([])
    setHasDownloaded(false)
    if (!studentId) return

    setLoadingSessions(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/sessions?student_id=${studentId}`)
      const sessions: Session[] = await res.json()
      setStudentSessions(sessions)

      const keys = new Set<string>()
      for (const s of sessions) keys.add(getPeriodKeyFromDate(new Date(s.date)))
      keys.add(getCurrentPeriod().key)
      const sorted = Array.from(keys).sort((a, b) => b.localeCompare(a))
      setAvailablePeriods(sorted)

      const current = getCurrentPeriod().key
      setSelectedPeriod(sorted.includes(current) ? current : sorted[0])
    } catch {
      setError('Failed to load sessions')
    } finally {
      setLoadingSessions(false)
    }
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    setHasDownloaded(false)
  }

  const handleDownloadPhotos = async () => {
    setDownloadingPhotos(true)
    setError('')
    try {
      const res = await fetch(
        `/api/admin/sessions/photos/download?student_id=${selectedStudentId}&period=${selectedPeriod}`
      )
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Download failed')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const studentName = selectedStudent?.name.replace(/\s+/g, '') ?? 'Student'
      const [year, month] = selectedPeriod.split('-').map(Number)
      const monthLabel = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).replace(' ', '')
      a.download = `Photos-${studentName}-${monthLabel}.zip`
      a.click()
      URL.revokeObjectURL(url)
      setHasDownloaded(true)
    } catch {
      setError('Download failed')
    } finally {
      setDownloadingPhotos(false)
    }
  }

  const handleDeletePhotos = async () => {
    const periodLabel = formatPeriodLabel(selectedPeriod)
    if (!confirm(`Delete all photos for ${selectedStudent?.name} in ${periodLabel}? Make sure you have downloaded them first. This cannot be undone.`)) return
    setDeletingPhotos(true)
    setError('')
    try {
      const res = await fetch(
        `/api/admin/sessions/photos?student_id=${selectedStudentId}&period=${selectedPeriod}`,
        { method: 'DELETE' }
      )
      if (!res.ok) { setError('Failed to delete photos'); return }
      // clear photo_path locally
      setStudentSessions(prev => prev.map(s => ({ ...s, photo_path: null })))
      setHasDownloaded(false)
    } catch {
      setError('Failed to delete photos')
    } finally {
      setDeletingPhotos(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this session?')) return
    try {
      const res = await fetch(`/api/admin/sessions/${id}`, { method: 'DELETE' })
      if (!res.ok) { setError('Failed to delete session'); return }
      setStudentSessions(prev => prev.filter(s => s.id !== id))
    } catch {
      setError('Failed to delete session')
    }
  }

  const filteredSessions = studentSessions.filter(
    s => getPeriodKeyFromDate(new Date(s.date)) === selectedPeriod
  )

  const selectedStudent = students.find(s => s.id === selectedStudentId)

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FAFAF8] text-[#2C1A0E]">
      <AdminNav />
      <main className="flex-1 p-5 md:p-8 max-w-6xl">
        <h1 className="text-2xl font-bold text-[#2C1A0E] mb-6 tracking-tight">Session Management</h1>

        {error && (
          <div className="mb-6 p-3 bg-red-50/50 backdrop-blur-sm border border-red-200/50 rounded-xl text-[13px] font-medium text-red-700 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {/* Dropdowns */}
        <div className="flex gap-4 mb-8">
          <div className="w-72 relative">
            <label className="block text-[12px] font-bold tracking-wider uppercase text-[#B0957A] mb-2">Student</label>
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={e => handleStudentChange(e.target.value)}
                disabled={loadingStudents}
                className="appearance-none w-full border border-[#E8D5B7]/80 rounded-xl px-4 py-2.5 pr-10 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] text-[#2C1A0E] shadow-sm transition-all"
              >
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#6B5744]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="w-64 relative">
            <label className="block text-[12px] font-bold tracking-wider uppercase text-[#B0957A] mb-2">Periode</label>
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={e => handlePeriodChange(e.target.value)}
                disabled={!selectedStudentId || loadingSessions}
                className="appearance-none w-full border border-[#E8D5B7]/80 rounded-xl px-4 py-2.5 pr-10 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] text-[#2C1A0E] shadow-sm disabled:opacity-50 transition-all"
              >
                {availablePeriods.length === 0
                  ? <option value="">Select Periode</option>
                  : availablePeriods.map(key => (
                      <option key={key} value={key}>{formatPeriodLabel(key)}</option>
                    ))
                }
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#6B5744]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table area */}
        {loadingSessions ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6B5744]">
            <div className="w-8 h-8 border-2 border-[#E8D5B7] border-t-[#F5A623] rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium">Loading sessions...</p>
          </div>
        ) : selectedStudentId && selectedPeriod ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* Photo actions */}
          <div className="flex items-center gap-3 mb-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-[#E8D5B7]/40">
            <button
              onClick={handleDownloadPhotos}
              disabled={downloadingPhotos}
              className="text-[13px] font-bold px-5 py-2 rounded-lg bg-[#2C1A0E] text-white hover:bg-[#3d2512] shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-sm transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {downloadingPhotos ? 'Downloading...' : 'Download All Photos'}
            </button>

            {hasDownloaded && (
              <button
                onClick={handleDeletePhotos}
                disabled={deletingPhotos}
                className="text-[13px] font-bold px-5 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 shadow-sm disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                {deletingPhotos ? 'Deleting...' : 'Delete All Photos'}
              </button>
            )}

            <p className="text-[12px] font-medium text-[#B0957A] ml-2">
              <span className="text-[#6B5744]">Pro tip:</span> Download photos before deleting. Deleted photos cannot be recovered.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 overflow-hidden">
            {/* Table header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8D5B7]/40 bg-[#FAFAF8]/50">
              <div>
                <span className="text-[15px] font-bold text-[#2C1A0E]">{selectedStudent?.name}</span>
                <span className="text-[13px] font-medium text-[#8a7662] ml-2 tracking-wide uppercase">· {formatPeriodLabel(selectedPeriod)}</span>
              </div>
              <span className="text-[12px] font-bold text-[#F5A623] bg-[#F5A623]/10 px-3 py-1 rounded-full">
                {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
              </span>
            </div>

            {filteredSessions.length === 0 ? (
              <p className="text-sm text-[#B0957A] text-center py-12 italic">No sessions in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#E8D5B7]/40 bg-white">
                      <th className="px-6 py-3 text-[11px] font-bold tracking-wider text-[#B0957A] uppercase whitespace-nowrap w-44">Date</th>
                      <th className="px-4 py-3 text-[11px] font-bold tracking-wider text-[#B0957A] uppercase w-32">Mentor</th>
                      <th className="px-4 py-3 text-[11px] font-bold tracking-wider text-[#B0957A] uppercase w-32">Attendance</th>
                      <th className="px-4 py-3 text-[11px] font-bold tracking-wider text-[#B0957A] uppercase">Activity</th>
                      <th className="px-4 py-3 text-[11px] font-bold tracking-wider text-[#B0957A] uppercase w-24">Photo</th>
                      <th className="px-6 py-3 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8D5B7]/20 text-[13px]">
                    {filteredSessions.map(session => {
                      const badge = ATTENDANCE_BADGE[session.attendance] ?? 'bg-gray-100 text-gray-600 ring-gray-500/10'
                      const label = ATTENDANCE_LABEL[session.attendance] ?? session.attendance
                      return (
                        <tr key={session.id} className="hover:bg-[#FAFAF8]/50 transition-colors group">
                          <td className="px-6 py-4 font-semibold text-[#2C1A0E] whitespace-nowrap">
                            {formatDate(session.date)}
                          </td>
                          <td className="px-4 py-4 text-[#6B5744] font-medium">
                            {session.mentor?.name ?? '—'}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-full font-semibold ring-1 ring-inset ${badge.includes('ring') ? badge : badge + ' ring-current/10'}`}>
                              {label}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[#6B5744] leading-relaxed max-w-[250px]">
                            {session.activity.length > 60
                              ? session.activity.slice(0, 60) + '…'
                              : session.activity}
                          </td>
                          <td className="px-4 py-4">
                            {session.photo_path ? (
                              <div className="flex flex-col gap-1.5 items-start">
                                <a href={session.photo_path} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden ring-1 ring-[#E8D5B7] hover:ring-[#F5A623] transition-all hover:scale-105 shadow-sm">
                                  <img
                                    src={session.photo_path}
                                    alt="Foto sesi"
                                    className="w-14 h-14 object-cover"
                                  />
                                </a>
                                <a
                                  href={`/api/admin/sessions/${session.id}/photo`}
                                  download
                                  className="text-[10px] font-bold text-[#F5A623] hover:text-[#E09615] flex items-center gap-1 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                  Get
                                </a>
                              </div>
                            ) : (
                              <span className="text-[#B0957A] font-medium">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDelete(session.id)}
                              className="text-[13px] font-bold text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-all"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
