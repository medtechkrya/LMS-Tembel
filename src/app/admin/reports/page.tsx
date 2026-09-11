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
  const [sendingId, setSendingId] = useState<string | null>(null)

  const handleSend = async (reportId: string) => {
    if (!confirm('Send this report to the parent?')) return
    setSendingId(reportId)
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/send`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send email')
      
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: data.report.status } : r))
      
      if (data.previewUrl) {
        window.open(data.previewUrl, '_blank')
      } else {
        alert('Email sent successfully!')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error sending email')
    } finally {
      setSendingId(null)
    }
  }

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
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FAFAF8] text-[#2C1A0E]">
      <AdminNav />
      <main className="flex-1 p-5 md:p-8 max-w-5xl">
        <h1 className="text-2xl font-bold text-[#2C1A0E] mb-8 tracking-tight">Reports</h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#6B5744]">
            <div className="w-8 h-8 border-2 border-[#E8D5B7] border-t-[#F5A623] rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium">Loading reports...</p>
          </div>
        ) : groups.length === 0 ? (
          <p className="text-sm text-[#B0957A] italic text-center py-12">No reports yet.</p>
        ) : (
          <div className="space-y-6">
            {groups.map(group => {
              const isOpen = open.has(group.key)
              const exportable = group.reports.filter(r => r.status === 'done' || r.status === 'sent')
              return (
                <div key={group.key} className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 overflow-hidden transition-all duration-300">
                  {/* Group header */}
                  <div className="flex items-center justify-between px-6 py-5 bg-[#FAFAF8]/30">
                    <button
                      onClick={() => toggleOpen(group.key)}
                      className="flex items-center gap-3 text-left group/btn outline-none"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-[#E8D5B7]/60 shadow-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        <svg className="w-4 h-4 text-[#F5A623]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                      <div>
                        <span className="text-[15px] font-bold text-[#2C1A0E] group-hover/btn:text-[#F5A623] transition-colors">
                          {group.label}
                        </span>
                        <span className="text-[13px] font-medium text-[#8a7662] ml-2">
                          ({group.reports.length} report{group.reports.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </button>
                    {exportable.length > 0 && (
                      <button
                        onClick={() => handleExport(group.period, group.label)}
                        disabled={exporting === group.period}
                        className="text-[13px] font-bold bg-[#F5A623] text-[#2C1A0E] px-4 py-2 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-[#F6AF3C] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        {exporting === group.period ? 'Exporting...' : `Export All PDF (${exportable.length})`}
                      </button>
                    )}
                  </div>

                  {/* Rows */}
                  {isOpen && (
                    <div className="border-t border-[#E8D5B7]/40 divide-y divide-[#E8D5B7]/20 animate-in fade-in slide-in-from-top-2 duration-300">
                      {group.reports.map(report => {
                        const canDownload = report.status === 'done' || report.status === 'sent'
                        const badgeStyle = STATUS_STYLE[report.status] ?? 'bg-gray-100 text-gray-500'
                        return (
                          <div key={report.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#FAFAF8]/50 transition-colors">
                            <div>
                              <p className="text-[15px] font-semibold text-[#2C1A0E]">{report.student.name}</p>
                              <p className="text-[13px] font-medium text-[#8a7662] mt-0.5">
                                Mentor: <span className="text-[#6B5744]">{report.mentor?.name ?? '—'}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 ring-inset ${badgeStyle.includes('ring') ? badgeStyle : badgeStyle + ' ring-current/10'}`}>
                                {STATUS_LABEL[report.status] ?? report.status}
                              </span>
                              <div className="flex items-center gap-3">
                                <Link
                                  href={`/admin/reports/${report.id}`}
                                  className="text-[13px] font-bold text-[#F5A623] hover:text-[#E09615] transition-colors bg-[#FAFAF8] px-3 py-1.5 rounded-lg border border-[#E8D5B7]/60 hover:bg-white hover:border-[#F5A623]/40 shadow-sm hover:shadow"
                                >
                                  View
                                </Link>
                                {canDownload && (
                                  <a
                                    href={`/api/reports/${report.id}/pdf`}
                                    download
                                    className="text-[13px] font-semibold text-[#6B5744] hover:text-[#2C1A0E] transition-colors"
                                  >
                                    PDF
                                  </a>
                                )}
                                <button
                                  onClick={() => handleSend(report.id)}
                                  disabled={sendingId === report.id || report.status === 'draft'}
                                  className={`text-[13px] font-semibold ml-1 transition-colors ${
                                    sendingId === report.id || report.status === 'draft'
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-[#F5A623] hover:text-[#E09615]'
                                  }`}
                                  title={report.status === 'draft' ? "Cannot send draft reports" : "Send to Parent"}
                                >
                                  {sendingId === report.id ? 'Sending...' : report.status === 'sent' ? 'Resend' : 'Send'}
                                </button>
                              </div>
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
