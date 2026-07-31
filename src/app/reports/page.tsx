'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Student {
  id: string
  name: string
  program: string
}

interface Report {
  id: string
  period_start: string
  period_end: string
  status: string
  student: { name: string }
  mentor: { name: string } | null
}

function getCurrentPeriodStart(): Date {
  const now = new Date()
  const day = now.getDate()
  if (day >= 26) return new Date(now.getFullYear(), now.getMonth(), 26)
  return new Date(now.getFullYear(), now.getMonth() - 1, 26)
}

function formatPeriod(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  return `${s.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-[#FFF3CD] text-[#856404]',
  done: 'bg-[#D4EDDA] text-[#155724]',
  sent: 'bg-[#CCE5FF] text-[#004085]',
  final: 'bg-[#D4EDDA] text-[#155724]',
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  done: 'Done',
  sent: 'Sent',
  final: 'Final',
}

export default function ReportsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/students').then(r => r.json()),
      fetch('/api/reports').then(r => r.json()),
    ]).then(([s, r]: [Student[], Report[]]) => {
      setStudents(s)
      // leave selectedStudent empty so user must explicitly choose
      const periodStart = getCurrentPeriodStart()
      const currentPeriodReports = (r as Report[]).filter(report => {
        const rs = new Date(report.period_start)
        return rs.getFullYear() === periodStart.getFullYear() &&
          rs.getMonth() === periodStart.getMonth() &&
          rs.getDate() === periodStart.getDate()
      })
      setReports(currentPeriodReports)
    }).finally(() => setLoading(false))
  }, [])

  const handleGenerate = async () => {
    if (!selectedStudent) { setError('Pilih siswa terlebih dahulu'); return }
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: selectedStudent }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal membuat laporan')
        return
      }
      router.push(`/reports/${data.id}`)
    } catch {
      setError('Gagal membuat laporan')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <p className="text-[#6B5744] text-sm">Memuat...</p>
      </div>
    )
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
          <Link href="/sessions" className="text-sm text-[#2C1A0E]/60 hover:text-[#2C1A0E] transition-colors">Sesi</Link>
          <Link href="/reports" className="text-sm font-semibold text-[#F5A623]">Laporan</Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-[#2C1A0E]">Monthly Reports</h1>
            <p className="text-sm text-[#6B5744] mt-0.5">{reports.length} laporan tersimpan</p>
          </div>
        </div>

        {/* Generate card */}
        <div className="bg-white rounded-lg border border-[#E8D5B7] p-4 mb-6">
          <p className="text-sm font-medium text-[#2C1A0E] mb-3">Buat Laporan Periode Ini</p>
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {error}
            </div>
          )}
          {students.length === 0 ? (
            <p className="text-xs text-[#6B5744]">Belum ada siswa terdaftar.</p>
          ) : (
            <div className="flex gap-2">
              <select
                value={selectedStudent}
                onChange={e => { setSelectedStudent(e.target.value); setError('') }}
                className="flex-1 border border-[#E8D5B7] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
              >
                <option value="">— Pilih Siswa —</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-[#F5A623] text-[#2C1A0E] text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#E09615] disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {generating ? 'Membuat...' : 'Generate'}
              </button>
            </div>
          )}
        </div>

        {/* Reports list */}
        {reports.length === 0 ? (
          <div className="text-center py-12 text-[#6B5744] text-sm">
            Belum ada laporan.
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(report => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="block bg-white rounded-lg border border-[#E8D5B7] p-4 hover:border-[#F5A623] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[#2C1A0E] text-sm">{report.student.name}</p>
                    <p className="text-xs text-[#6B5744] mt-0.5">
                      {formatPeriod(report.period_start, report.period_end)}
                    </p>
                    {report.mentor && (
                      <p className="text-xs text-[#6B5744]">Mentor: {report.mentor.name}</p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${STATUS_BADGE[report.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABEL[report.status] ?? report.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
