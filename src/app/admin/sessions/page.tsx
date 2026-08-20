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

function getSessionPeriodKey(dateStr: string): string {
  const d = new Date(dateStr)
  let year = d.getFullYear()
  let month = d.getMonth() + 1
  if (d.getDate() >= 26) {
    month += 1
    if (month > 12) { month = 1; year++ }
  }
  return `${year}-${String(month).padStart(2, '0')}`
}

function getCurrentPeriodKey(): string {
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() + 1
  if (now.getDate() >= 26) {
    month += 1
    if (month > 12) { month = 1; year++ }
  }
  return `${year}-${String(month).padStart(2, '0')}`
}

function formatPeriodLabel(key: string): string {
  const [yearStr, monthStr] = key.split('-')
  const year = parseInt(yearStr)
  const month = parseInt(monthStr)
  const startDate = new Date(year, month - 2, 26)
  const endDate = new Date(year, month - 1, 25)
  const s = startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  const e = endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${s} – ${e}`
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
      for (const s of sessions) keys.add(getSessionPeriodKey(s.date))
      keys.add(getCurrentPeriodKey())
      const sorted = Array.from(keys).sort((a, b) => b.localeCompare(a))
      setAvailablePeriods(sorted)

      const current = getCurrentPeriodKey()
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
    s => getSessionPeriodKey(s.date) === selectedPeriod
  )

  const selectedStudent = students.find(s => s.id === selectedStudentId)

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <AdminNav />
      <main className="flex-1 p-8 max-w-5xl">
        <h1 className="text-2xl font-bold text-[#2C1A0E] mb-6">Session Management</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Dropdowns */}
        <div className="flex gap-4 mb-6">
          <div className="w-72">
            <label className="block text-xs font-medium text-[#6B5744] mb-1.5">Student</label>
            <select
              value={selectedStudentId}
              onChange={e => handleStudentChange(e.target.value)}
              disabled={loadingStudents}
              className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-[#2C1A0E]"
            >
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="w-64">
            <label className="block text-xs font-medium text-[#6B5744] mb-1.5">Periode</label>
            <select
              value={selectedPeriod}
              onChange={e => handlePeriodChange(e.target.value)}
              disabled={!selectedStudentId || loadingSessions}
              className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-[#2C1A0E] disabled:opacity-50"
            >
              {availablePeriods.length === 0
                ? <option value="">Select Periode</option>
                : availablePeriods.map(key => (
                    <option key={key} value={key}>{formatPeriodLabel(key)}</option>
                  ))
              }
            </select>
          </div>
        </div>

        {/* Table area */}
        {loadingSessions ? (
          <p className="text-sm text-[#6B5744]">Loading sessions...</p>
        ) : selectedStudentId && selectedPeriod ? (
          <>
          {/* Photo actions */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={handleDownloadPhotos}
              disabled={downloadingPhotos}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-[#2C1A0E] text-white hover:bg-[#3d2512] disabled:opacity-50 transition-colors"
            >
              {downloadingPhotos ? 'Downloading...' : 'Download All Photos'}
            </button>

            {hasDownloaded && (
              <button
                onClick={handleDeletePhotos}
                disabled={deletingPhotos}
                className="text-sm font-medium px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                {deletingPhotos ? 'Deleting...' : 'Delete All Photos'}
              </button>
            )}

            <p className="text-xs text-[#6B5744] ml-1">
              Download photos before deleting. Deleted photos cannot be recovered.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#E8D5B7]">
            {/* Table header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8D5B7]">
              <div>
                <span className="text-sm font-semibold text-[#2C1A0E]">{selectedStudent?.name}</span>
                <span className="text-xs text-[#6B5744] ml-2">· {formatPeriodLabel(selectedPeriod)}</span>
              </div>
              <span className="text-xs text-[#6B5744]">
                {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} in this period
              </span>
            </div>

            {filteredSessions.length === 0 ? (
              <p className="text-sm text-[#6B5744] px-5 py-6 italic">No sessions in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#E8D5B7] bg-[#FAFAF8]">
                      <th className="text-left px-5 py-2.5 font-medium text-[#6B5744] whitespace-nowrap w-44">Date</th>
                      <th className="text-left px-3 py-2.5 font-medium text-[#6B5744] w-28">Mentor</th>
                      <th className="text-left px-3 py-2.5 font-medium text-[#6B5744] w-28">Attendance</th>
                      <th className="text-left px-3 py-2.5 font-medium text-[#6B5744]">Activity</th>
                      <th className="text-left px-3 py-2.5 font-medium text-[#6B5744] w-24">Photo</th>
                      <th className="px-5 py-2.5 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8D5B7]">
                    {filteredSessions.map(session => {
                      const badge = ATTENDANCE_BADGE[session.attendance] ?? 'bg-gray-100 text-gray-600'
                      const label = ATTENDANCE_LABEL[session.attendance] ?? session.attendance
                      return (
                        <tr key={session.id} className="hover:bg-[#FAFAF8] transition-colors">
                          <td className="px-5 py-3 text-[#2C1A0E] whitespace-nowrap">
                            {formatDate(session.date)}
                          </td>
                          <td className="px-3 py-3 text-[#6B5744]">
                            {session.mentor?.name ?? '—'}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full font-medium ${badge}`}>
                              {label}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-[#2C1A0E] max-w-xs">
                            {session.activity.length > 50
                              ? session.activity.slice(0, 50) + '…'
                              : session.activity}
                          </td>
                          <td className="px-3 py-3">
                            {session.photo_path ? (
                              <div className="flex flex-col gap-1">
                                <a href={session.photo_path} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={session.photo_path}
                                    alt="Foto sesi"
                                    className="w-[60px] h-[60px] object-cover rounded"
                                  />
                                </a>
                                <a
                                  href={`/api/admin/sessions/${session.id}/photo`}
                                  download
                                  className="text-[10px] text-[#F5A623] hover:underline"
                                >
                                  Download
                                </a>
                              </div>
                            ) : (
                              <span className="text-[#6B5744]">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              onClick={() => handleDelete(session.id)}
                              className="text-xs text-red-500 hover:text-red-700 transition-colors"
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
          </>
        ) : null}
      </main>
    </div>
  )
}
