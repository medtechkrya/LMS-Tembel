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

function PdfButton({ id }: { id: string }) {
  return (
    <a
      href={`/api/reports/${id}/pdf`}
      download
      className="bg-[#2C1A0E] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#3d2512] transition-colors"
    >
      Download PDF
    </a>
  )
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#FAFAF8]">
        <AdminNav />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-[#6B5744] text-sm">Loading...</p>
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
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <AdminNav />
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link href="/admin/reports" className="text-[#6B5744] hover:text-[#2C1A0E] text-lg">←</Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-[#2C1A0E]">Report Detail</h1>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLE[report.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABEL[report.status] ?? report.status}
                  </span>
                </div>
                <p className="text-sm text-[#6B5744] mt-0.5">
                  {report.student.name} · {formatPeriod(report.period_start, report.period_end)}
                </p>
              </div>
            </div>
            <PdfButton id={id} />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          {saved && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              Changes saved.
            </div>
          )}

          <div className="space-y-4">
            {/* Header info */}
            <div className="bg-white rounded-lg border border-[#E8D5B7] p-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-[#6B5744] mb-0.5">Child</p>
                  <p className="font-medium text-[#2C1A0E]">{report.student.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B5744] mb-0.5">Program</p>
                  <p className="font-medium text-[#2C1A0E]">{report.student.program}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B5744] mb-0.5">Mentor</p>
                  <p className="font-medium text-[#2C1A0E]">{report.mentor?.name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B5744] mb-0.5">Period</p>
                  <p className="font-medium text-[#2C1A0E]">{formatPeriod(report.period_start, report.period_end)}</p>
                </div>
              </div>
            </div>

            {/* Section 1 — editable */}
            <div className="bg-white rounded-lg border border-[#E8D5B7] p-5">
              <h2 className="text-sm font-semibold text-[#2C1A0E] mb-3">1. Learning Achievements This Period</h2>
              <textarea
                value={form.summary_achievements}
                onChange={e => setForm(f => ({ ...f, summary_achievements: e.target.value }))}
                rows={5}
                placeholder="Learning achievements this period..."
                className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] resize-none"
              />
            </div>

            {/* Section 2 — Journal, read-only */}
            <div className="bg-white rounded-lg border border-[#E8D5B7] p-5">
              <h2 className="text-sm font-semibold text-[#2C1A0E] mb-1">2. Journal of Activities</h2>
              <p className="text-xs text-[#6B5744] mb-3">Auto-filled from sessions in this period</p>
              {report.sessions.length === 0 ? (
                <p className="text-sm text-[#6B5744] italic">No sessions recorded in this period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[480px]">
                    <thead>
                      <tr className="border-b border-[#E8D5B7]">
                        <th className="text-left py-2 pr-3 font-medium text-[#6B5744] w-[20%]">Session</th>
                        <th className="text-left py-2 pr-3 font-medium text-[#6B5744] w-[30%]">Activity</th>
                        <th className="text-left py-2 font-medium text-[#6B5744] w-[50%]">Observation Results</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.sessions.map((session, i) => (
                        <tr key={session.id} className="border-b border-[#E8D5B7] last:border-0">
                          <td className="py-2.5 pr-3 text-[#6B5744] align-top whitespace-nowrap">
                            <span className="font-medium">Session {i + 1}</span>
                            <br />
                            <span className="text-[#6B5744]">{formatDate(session.date)}</span>
                          </td>
                          <td className="py-2.5 pr-3 text-[#2C1A0E] align-top">{session.activity}</td>
                          <td className="py-2.5 text-[#2C1A0E] align-top">{session.observation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Section 3 — editable */}
            <div className="bg-white rounded-lg border border-[#E8D5B7] p-5">
              <h2 className="text-sm font-semibold text-[#2C1A0E] mb-3">3. Overall Development Observation</h2>
              <textarea
                value={form.summary_general}
                onChange={e => setForm(f => ({ ...f, summary_general: e.target.value }))}
                rows={5}
                placeholder="Overall development observation..."
                className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] resize-none"
              />
            </div>

            {/* Section 4 — editable */}
            <div className="bg-white rounded-lg border border-[#E8D5B7] p-5">
              <h2 className="text-sm font-semibold text-[#2C1A0E] mb-3">4. Notes for Parents</h2>
              <textarea
                value={form.summary_parents}
                onChange={e => setForm(f => ({ ...f, summary_parents: e.target.value }))}
                rows={5}
                placeholder="Notes for parents..."
                className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] resize-none"
              />
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#F5A623] text-[#2C1A0E] font-bold py-3 rounded-lg text-sm hover:bg-[#E09615] disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            {/* Bottom actions */}
            <div className="flex gap-3">
              <PdfButton id={id} />

              {report.status === 'done' && (
                <button
                  onClick={handleMarkSent}
                  disabled={markingSent}
                  className="bg-[#F5A623] text-[#2C1A0E] text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#E09615] disabled:opacity-50 transition-colors"
                >
                  {markingSent ? 'Updating...' : 'Mark as Sent'}
                </button>
              )}

              <button
                disabled
                className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                title="Coming soon"
              >
                Send to Parent
              </button>

              {report.status === 'draft' && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="ml-auto text-sm font-medium px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Delete Report'}
                </button>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
