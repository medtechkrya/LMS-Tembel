'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '../../_nav'

interface Session {
  id: string
  date: string
  activity: string
  observation: string
}

interface Report {
  id: string
  period_start: string
  period_end: string
  mentor: { name: string } | null
  summary_achievements: string | null
  summary_general: string | null
  summary_parents: string | null
  status: string
  student: { name: string; program: string }
  sessions: Session[]
}

const STATUS_LABEL: Record<string, string> = { draft: 'Draft', done: 'Done', sent: 'Sent' }
const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-[#FFF3CD] text-[#856404]',
  done: 'bg-[#D4EDDA] text-[#155724]',
  sent: 'bg-[#CCE5FF] text-[#004085]',
}

function formatPeriod(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  return `${s.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}



export default function AdminReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [markingSent, setMarkingSent] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  // Email sending states
  const [sendingEmail, setSendingEmail] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    summary_achievements: '',
    summary_general: '',
    summary_parents: '',
  })

  useEffect(() => {
    fetch(`/api/reports/${id}`)
      .then(r => r.json())
      .then((data: Report) => {
        setReport(data)
        setForm({
          summary_achievements: data.summary_achievements ?? '',
          summary_general: data.summary_general ?? '',
          summary_parents: data.summary_parents ?? '',
        })
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        setError((await res.json()).error || 'Failed to save')
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this report? This cannot be undone.')) return
    setDeleting(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/reports/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        setError('Failed to delete report')
        return
      }
      router.push('/admin/reports')
    } catch {
      setError('Failed to delete report')
    } finally {
      setDeleting(false)
    }
  }

  const handleMarkSent = async () => {
    if (!confirm('Mark this report as Sent?')) return
    setMarkingSent(true)
    setError('')
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sent' }),
      })
      if (!res.ok) {
        setError((await res.json()).error || 'Failed')
        return
      }
      setReport(r => r ? { ...r, status: 'sent' } : r)
    } catch {
      setError('Failed to update status')
    } finally {
      setMarkingSent(false)
    }
  }

  const handleSendToParent = async () => {
    if (!confirm('Are you sure you want to send this report to the parent?')) return
    setSendingEmail(true)
    setError('')
    setPreviewUrl('')
    try {
      const res = await fetch(`/api/admin/reports/${id}/send`, { method: 'POST' })
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Failed to send email')
        return
      }
      
      setReport(prev => prev ? { ...prev, status: data.report.status } : data.report)
      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl)
      } else {
        alert('Email sent successfully!')
      }
    } catch {
      setError('Failed to send email')
    } finally {
      setSendingEmail(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#FAFAF8]">
        <AdminNav />
        <main className="flex-1 flex flex-col items-center justify-center text-[#6B5744]">
          <div className="w-10 h-10 border-4 border-[#E8D5B7] border-t-[#F5A623] rounded-full animate-spin mb-4 shadow-sm" />
          <p className="text-[14px] font-bold tracking-wide">Loading report...</p>
        </main>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex min-h-screen bg-[#FAFAF8]">
        <AdminNav />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-red-400 text-sm">Report not found.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FAFAF8] text-[#2C1A0E]">
      <AdminNav />
      <main className="flex-1 p-5 md:p-8 overflow-x-hidden">
        <div className="max-w-3xl mx-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/admin/reports" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#E8D5B7]/40 text-[#6B5744] hover:text-[#F5A623] hover:border-[#F5A623]/40 hover:-translate-x-1 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-[#2C1A0E] tracking-tight">Report Detail</h1>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${STATUS_STYLE[report.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABEL[report.status] ?? report.status}
                  </span>
                </div>
                <p className="text-[14px] font-medium text-[#6B5744] mt-1">
                  {report.student.name} <span className="text-[#E8D5B7] mx-1">|</span> {formatPeriod(report.period_start, report.period_end)}
                </p>
              </div>
            </div>
            <a
              href={`/api/reports/${id}/pdf`}
              download
              className="bg-[#2C1A0E] text-white text-[13px] font-bold px-5 py-2.5 rounded-xl hover:bg-[#3d2512] hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download PDF
            </a>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl text-[13px] font-medium text-red-700 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          {saved && (
            <div className="mb-6 p-4 bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-2xl text-[13px] font-bold text-green-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Changes saved.
            </div>
          )}
          {previewUrl && (
            <div className="mb-6 p-4 bg-[#F5A623]/10 backdrop-blur-sm border border-[#F5A623]/30 rounded-2xl text-[13px] font-bold text-[#2C1A0E] flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#F5A623]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Email sent successfully (Test Mode)!
              </div>
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-[#F5A623] hover:underline flex items-center gap-1 font-medium ml-7">
                Click here to preview the sent email in Ethereal
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          )}

          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-[#FAFAF8] p-4 rounded-2xl border border-[#E8D5B7]/40">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-[#B0957A]">Student</p>
                  <p className="font-bold text-[#2C1A0E] mt-1">{report.student.name}</p>
                </div>
                <div className="bg-[#FAFAF8] p-4 rounded-2xl border border-[#E8D5B7]/40">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-[#B0957A]">Program</p>
                  <p className="font-bold text-[#2C1A0E] mt-1">{report.student.program}</p>
                </div>
                <div className="bg-[#FAFAF8] p-4 rounded-2xl border border-[#E8D5B7]/40">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-[#B0957A]">Mentor</p>
                  <p className="font-bold text-[#2C1A0E] mt-1">{report.mentor?.name ?? '—'}</p>
                </div>
                <div className="bg-[#FAFAF8] p-4 rounded-2xl border border-[#E8D5B7]/40">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-[#B0957A]">Period</p>
                  <p className="font-bold text-[#2C1A0E] mt-1 text-xs">{formatPeriod(report.period_start, report.period_end)}</p>
                </div>
              </div>
            </div>

            {/* Section 1 */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 p-6">
              <h2 className="text-[15px] font-bold text-[#2C1A0E] mb-3">1. Learning Achievements This Period</h2>
              <textarea
                value={form.summary_achievements}
                onChange={e => setForm(f => ({ ...f, summary_achievements: e.target.value }))}
                rows={5}
                placeholder="Learning achievements this period..."
                className="w-full bg-[#FAFAF8] border border-[#E8D5B7]/60 rounded-2xl px-4 py-3 text-[14px] leading-relaxed text-[#2C1A0E] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] focus:bg-white resize-none transition-all"
              />
            </div>

            {/* Section 2 */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 p-6">
              <div className="mb-4">
                <h2 className="text-[15px] font-bold text-[#2C1A0E] mb-1">2. Journal of Activities</h2>
                <p className="text-[12px] font-medium text-[#B0957A]">Auto-filled from sessions in this period</p>
              </div>
              {report.sessions.length === 0 ? (
                <div className="bg-[#FAFAF8] rounded-2xl border border-[#E8D5B7]/40 py-8 text-center">
                  <p className="text-[13px] font-medium text-[#B0957A]">No sessions recorded in this period.</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-2 px-2">
                  <table className="w-full text-left min-w-[500px]">
                    <thead>
                      <tr className="border-b border-[#E8D5B7]/40">
                        <th className="py-3 px-2 text-[11px] font-bold tracking-wider text-[#B0957A] uppercase w-[20%]">Session</th>
                        <th className="py-3 px-2 text-[11px] font-bold tracking-wider text-[#B0957A] uppercase w-[30%]">Activity</th>
                        <th className="py-3 px-2 text-[11px] font-bold tracking-wider text-[#B0957A] uppercase w-[50%]">Observation Results</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8D5B7]/20">
                      {report.sessions.map((session, i) => (
                        <tr key={session.id} className="hover:bg-[#FAFAF8]/50 transition-colors">
                          <td className="py-4 px-2 align-top">
                            <span className="font-bold text-[#2C1A0E] text-[13px] bg-[#F5A623]/10 px-2 py-0.5 rounded-md inline-block mb-1">Session {i + 1}</span>
                            <br />
                            <span className="text-[12px] font-medium text-[#8a7662]">{formatDate(session.date)}</span>
                          </td>
                          <td className="py-4 px-2 text-[#2C1A0E] text-[13px] leading-relaxed align-top">{session.activity}</td>
                          <td className="py-4 px-2 text-[#2C1A0E] text-[13px] leading-relaxed align-top">{session.observation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 3 */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 p-6">
              <h2 className="text-[15px] font-bold text-[#2C1A0E] mb-3">3. Overall Development Observation</h2>
              <textarea
                value={form.summary_general}
                onChange={e => setForm(f => ({ ...f, summary_general: e.target.value }))}
                rows={5}
                placeholder="Overall development observation..."
                className="w-full bg-[#FAFAF8] border border-[#E8D5B7]/60 rounded-2xl px-4 py-3 text-[14px] leading-relaxed text-[#2C1A0E] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] focus:bg-white resize-none transition-all"
              />
            </div>

            {/* Section 4 */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 p-6">
              <h2 className="text-[15px] font-bold text-[#2C1A0E] mb-3">4. Notes for Parents</h2>
              <textarea
                value={form.summary_parents}
                onChange={e => setForm(f => ({ ...f, summary_parents: e.target.value }))}
                rows={5}
                placeholder="Notes for parents..."
                className="w-full bg-[#FAFAF8] border border-[#E8D5B7]/60 rounded-2xl px-4 py-3 text-[14px] leading-relaxed text-[#2C1A0E] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] focus:bg-white resize-none transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#F5A623] text-[#2C1A0E] font-bold py-3.5 rounded-2xl text-[14px] shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-[#F6AF3C] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm transition-all"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              <div className="flex flex-wrap items-center gap-3">
                {report.status === 'done' && (
                  <button
                    onClick={handleMarkSent}
                    disabled={markingSent}
                    className="flex-1 bg-white border border-[#E8D5B7] text-[#2C1A0E] text-[13px] font-bold px-4 py-3 rounded-xl shadow-sm hover:bg-[#FAFAF8] disabled:opacity-50 transition-all text-center"
                  >
                    {markingSent ? 'Updating...' : 'Mark as Sent'}
                  </button>
                )}
                
                {(report.status === 'done' || report.status === 'sent') && (
                  <button
                    onClick={handleSendToParent}
                    disabled={sendingEmail}
                    className="flex-1 bg-[#2C1A0E] text-white text-[13px] font-bold px-4 py-3 rounded-xl shadow-sm hover:bg-[#3d2512] disabled:opacity-50 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {sendingEmail ? 'Sending...' : (report.status === 'sent' ? 'Resend to Parent' : 'Send to Parent')}
                  </button>
                )}

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-50 text-red-600 text-[13px] font-bold px-5 py-3 rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors ml-auto flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Delete Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
