'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminNav from '../_nav'

interface Report {
  id: string
  period_end: string
  status: string
  student: { name: string }
  mentor: { name: string } | null
}

const STATUS_LABEL: Record<string, string> = { draft: 'Draft', done: 'Done', sent: 'Sent' }
const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-[#FFF3CD] text-[#856404]',
  done: 'bg-[#D4EDDA] text-[#155724]',
  sent: 'bg-[#CCE5FF] text-[#004085]',
}

function groupByMonth(reports: Report[]): Array<{ key: string; label: string; period: string; reports: Report[] }> {
  const map = new Map<string, Report[]>()
  for (const r of reports) {
    const d = new Date(r.period_end)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, reps]) => {
      const d = new Date(reps[0].period_end)
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      return { key, label, period: key, reports: reps }
    })
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<Set<string>>(new Set())
  const [exporting, setExporting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.json())
      .then((data: Report[]) => {
        setReports(data)
        if (data.length > 0) {
          const d = new Date(data[0].period_end)
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          setOpen(new Set([key]))
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const toggleOpen = (key: string) => {
    setOpen(prev => {
      const next = new Set(prev)
      if (next.has(key)) { next.delete(key) } else { next.add(key) }
      return next
    })
  }

  const handleExport = async (period: string, label: string) => {
    setExporting(period)
    try {
      const res = await fetch(`/api/admin/reports/export?period=${period}`)
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Export failed')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `TemanBelajar-Reports-${label.replace(' ', '')}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed')
    } finally {
      setExporting(null)
    }
  }

  const groups = groupByMonth(reports)

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <AdminNav />
      <main className="flex-1 p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-[#2C1A0E] mb-6">Reports</h1>

        {loading ? (
          <p className="text-sm text-[#6B5744]">Loading...</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-[#6B5744]">No reports yet.</p>
        ) : (
          <div className="space-y-4">
            {groups.map(group => {
              const isOpen = open.has(group.key)
              const exportable = group.reports.filter(r => r.status === 'done' || r.status === 'sent')
              return (
                <div key={group.key} className="bg-white rounded-xl border border-[#E8D5B7]">
                  {/* Group header */}
                  <div className="flex items-center justify-between px-5 py-4">
                    <button
                      onClick={() => toggleOpen(group.key)}
                      className="flex items-center gap-2 text-left"
                    >
                      <span className="text-sm font-semibold text-[#2C1A0E]">
                        {group.label}
                      </span>
                      <span className="text-xs text-[#6B5744]">
                        ({group.reports.length} report{group.reports.length !== 1 ? 's' : ''})
                      </span>
                      <span className="text-xs text-[#6B5744]">{isOpen ? '▲' : '▼'}</span>
                    </button>
                    {exportable.length > 0 && (
                      <button
                        onClick={() => handleExport(group.period, group.label)}
                        disabled={exporting === group.period}
                        className="text-xs font-bold bg-[#F5A623] text-[#2C1A0E] px-3 py-1.5 rounded-lg hover:bg-[#E09615] disabled:opacity-50 transition-colors"
                      >
                        {exporting === group.period ? 'Exporting...' : `Export All PDF (${exportable.length})`}
                      </button>
                    )}
                  </div>

                  {/* Rows */}
                  {isOpen && (
                    <div className="border-t border-[#E8D5B7] divide-y divide-[#E8D5B7]">
                      {group.reports.map(report => {
                        const canDownload = report.status === 'done' || report.status === 'sent'
                        return (
                          <div key={report.id} className="flex items-center justify-between px-5 py-3">
                            <div>
                              <p className="text-sm font-medium text-[#2C1A0E]">{report.student.name}</p>
                              <p className="text-xs text-[#6B5744]">
                                Mentor: {report.mentor?.name ?? '—'}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLE[report.status] ?? 'bg-gray-100 text-gray-500'}`}>
                                {STATUS_LABEL[report.status] ?? report.status}
                              </span>
                              <Link
                                href={`/admin/reports/${report.id}`}
                                className="text-xs text-[#F5A623] hover:underline"
                              >
                                View
                              </Link>
                              {canDownload && (
                                <a
                                  href={`/api/reports/${report.id}/pdf`}
                                  download
                                  className="text-xs text-[#6B5744] hover:underline"
                                >
                                  PDF
                                </a>
                              )}
                              <button
                                disabled
                                className="text-xs text-gray-300 cursor-not-allowed"
                                title="Coming soon"
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
