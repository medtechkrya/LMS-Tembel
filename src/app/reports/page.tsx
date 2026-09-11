'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MentorNav from '@/components/MentorNav'
import { getAvailablePeriods, getCurrentPeriod, formatPeriod } from '@/lib/period'

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

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-[#FFF3CD]/80 text-[#856404] ring-[#856404]/10',
  done: 'bg-[#D4EDDA]/80 text-[#155724] ring-[#155724]/10',
  sent: 'bg-[#CCE5FF]/80 text-[#004085] ring-[#004085]/10',
  final: 'bg-[#D4EDDA]/80 text-[#155724] ring-[#155724]/10',
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
  const [allReports, setAllReports] = useState<Report[]>([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const periods = getAvailablePeriods()
  const [selectedPeriodKey, setSelectedPeriodKey] = useState(getCurrentPeriod().key)

  useEffect(() => {
    Promise.all([
      fetch('/api/students').then(r => r.json()),
      fetch('/api/reports').then(r => r.json()),
    ]).then(([s, r]: [Student[], Report[]]) => {
      setStudents(s)
      setAllReports(r as Report[])
    }).finally(() => setLoading(false))
  }, [])
  
  const selectedPeriod = periods.find(p => p.key === selectedPeriodKey) || periods[0]
  
  const reports = allReports.filter(report => {
    const rs = new Date(report.period_start)
    return rs.getFullYear() === selectedPeriod.start.getFullYear() &&
      rs.getMonth() === selectedPeriod.start.getMonth() &&
      rs.getDate() === selectedPeriod.start.getDate()
  })

  const handleGenerate = async () => {
    if (!selectedStudent) { setError('Pilih siswa terlebih dahulu'); return }
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          student_id: selectedStudent,
          period_key: selectedPeriod.key // send the selected period
        }),
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
      <div className="min-h-screen bg-[#FAFAF8] text-[#2C1A0E]">
        {/* Nav */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-[#E8D5B7]/50 sticky top-0 z-20">
          <div className="max-w-xl mx-auto px-5 flex items-center gap-6 h-14">
            <div className="flex items-center gap-2.5 mr-auto">
              <img src="/Logo-Teman-Belajar.png" alt="Teman Belajar" className="h-7" />
              <div className="w-px h-4 bg-[#E8D5B7] rounded" />
              <img src="/krya-logo.png" alt="Krya" className="h-6" />
            </div>
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center py-32 text-[#6B5744]">
          <div className="w-10 h-10 border-4 border-[#E8D5B7] border-t-[#F5A623] rounded-full animate-spin mb-4 shadow-sm" />
          <p className="text-[14px] font-bold tracking-wide">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2C1A0E]">
      <MentorNav />

      <div className="max-w-xl mx-auto px-5 py-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#2C1A0E] tracking-tight">Monthly Reports</h1>
            <div className="mt-2 relative">
              <select
                value={selectedPeriodKey}
                onChange={e => {
                  setSelectedPeriodKey(e.target.value)
                  setError('')
                  setSelectedStudent('')
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
        </div>

        {/* Generate card */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5A623]/5 rounded-bl-full -z-10" />
          <h2 className="text-[15px] font-semibold text-[#2C1A0E] mb-1">Generate Report</h2>
          <p className="text-[13px] text-[#6B5744] mb-4">Select a student to compile their {selectedPeriod.label} recap into a PDF report.</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50/50 backdrop-blur-sm border border-red-200/50 rounded-xl text-[13px] font-medium text-red-700 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          
          {students.length === 0 ? (
            <p className="text-[13px] text-[#B0957A]">No registered student.</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <select
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                  className="w-full appearance-none bg-[#FAFAF8] border border-[#E8D5B7]/60 rounded-xl pl-4 pr-10 py-3 text-[14px] font-medium text-[#2C1A0E] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="" disabled>Select Student / Pilih Siswa</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#6B5744]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating || !selectedStudent}
                className="w-full sm:w-auto bg-[#F5A623] text-[#2C1A0E] text-[14px] font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-[#F6AF3C] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
              >
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          )}
        </div>

        {/* Reports list */}
        {reports.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white border border-[#E8D5B7]/40 rounded-3xl shadow-sm">
            <div className="w-16 h-16 mx-auto bg-[#FAFAF8] rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#E8D5B7]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-[#2C1A0E] font-medium mb-1.5">No reports yet</p>
            <p className="text-[13px] text-[#6B5744]">Belum ada laporan di periode ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(report => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="block bg-white rounded-2xl shadow-sm border border-[#E8D5B7]/40 p-5 hover:shadow-md hover:border-[#F5A623]/40 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-[#2C1A0E] text-[15px] group-hover:text-[#F5A623] transition-colors">{report.student.name}</p>
                      {report.mentor && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FAFAF8] text-[#6B5744] border border-[#E8D5B7]/60">
                          {report.mentor.name}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] font-medium text-[#8a7662] uppercase tracking-wide">
                      {formatPeriod(new Date(report.period_start), new Date(report.period_end))}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ring-1 ring-inset ${STATUS_BADGE[report.status] ?? 'bg-gray-100 text-gray-600 ring-gray-500/10'}`}>
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
