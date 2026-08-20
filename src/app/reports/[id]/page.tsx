'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Session {
  id: string
  date: string
  activity: string
  observation: string
}

interface Mentor {
  id: string
  name: string
  status: string
}

interface Report {
  id: string
  period_start: string
  period_end: string
  mentor_id: string | null
  mentor: Mentor | null
  summary_achievements: string | null
  summary_general: string | null
  summary_parents: string | null
  status: string
  student: { name: string; program: string }
  sessions: Session[]
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

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [report, setReport] = useState<Report | null>(null)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [markingDone, setMarkingDone] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    mentor_id: '',
    summary_achievements: '',
    summary_general: '',
    summary_parents: '',
  })

  useEffect(() => {
    Promise.all([
      fetch(`/api/reports/${id}`).then(r => r.json()),
      fetch('/api/mentors').then(r => r.json()),
    ]).then(([data, m]: [Report, Mentor[]]) => {
      setReport(data)
      setMentors((m as Mentor[]).filter(x => x.status === 'active'))
      setForm({
        mentor_id: data.mentor_id ?? '',
        summary_achievements: data.summary_achievements ?? '',
        summary_general: data.summary_general ?? '',
        summary_parents: data.summary_parents ?? '',
      })
    }).finally(() => setLoading(false))
  }, [id])

  const isLocked = report?.status === 'done' || report?.status === 'sent'

  const handleSave = async () => {
    if (isLocked) return
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, mentor_id: form.mentor_id || null }),
      })
      if (!res.ok) {
        setError((await res.json()).error || 'Gagal menyimpan')
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleMarkDone = async () => {
    const missing: string[] = []
    if (!form.mentor_id) missing.push('Nama Mentor')
    if (!form.summary_achievements.trim()) missing.push('Learning Achievements')
    if (!form.summary_general.trim()) missing.push('Overall Development Observation')
    if (!form.summary_parents.trim()) missing.push('Notes for Parents')

    if (missing.length > 0) {
      const last = missing.pop()
      const list = missing.length > 0 ? `${missing.join(', ')}, dan ${last}` : last
      setError(`Please fill all part of the report / Harap isi semua bagian sebelum menyelesaikan laporan: ${list}`)
      return
    }

    if (!confirm('Mark this report as Done? Editing will be disabled.')) return
    setMarkingDone(true)
    setError('')
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done' }),
      })
      if (!res.ok) {
        setError((await res.json()).error || 'Gagal')
        return
      }
      setReport(r => r ? { ...r, status: 'done' } : r)
    } catch {
      setError('Gagal')
    } finally {
      setMarkingDone(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <p className="text-[#6B5744] text-sm">Loading... / Memuat...</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <p className="text-red-400 text-sm">No report found / Laporan tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/reports" className="text-[#6B5744] hover:text-[#2C1A0E] text-lg">←</Link>
          <div className="flex items-center gap-2">
            <img src="/Logo-Teman-Belajar.png" alt="Teman Belajar" className="h-7" />
            <img src="/krya-logo.png" alt="Krya" className="h-7" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#2C1A0E]">Monthly Report</h1>
            <p className="text-sm text-[#6B5744] mt-0.5">
              {report.student.name} · {formatPeriod(report.period_start, report.period_end)}
            </p>
          </div>
        </div>

        {/* Locked banner */}
        {isLocked && (
          <div className="mb-4 p-3 bg-[#FFF3CD] border border-[#E8D5B7] rounded-lg text-sm text-[#856404]">
            Report has been submitted. Contact admin to make changes.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        {saved && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            Saved! / Tersimpan!
          </div>
        )}

        <div className="space-y-5">
          {/* Report header info */}
          <div className="bg-white rounded-lg border border-[#E8D5B7] p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#6B5744] mb-1">Mentor</label>
                <select
                  value={form.mentor_id}
                  onChange={e => setForm(f => ({ ...f, mentor_id: e.target.value }))}
                  disabled={isLocked}
                  className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] disabled:bg-gray-50 disabled:text-[#6B5744]"
                >
                  <option value="">— Select Mentor / Pilih Mentor —</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm pt-1">
                <div>
                  <p className="text-xs text-[#6B5744]">Periode</p>
                  <p className="font-medium text-[#2C1A0E] mt-0.5">
                    {formatPeriod(report.period_start, report.period_end)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B5744]">Student's Name</p>
                  <p className="font-medium text-[#2C1A0E] mt-0.5">{report.student.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="bg-white rounded-lg border border-[#E8D5B7] p-4">
            <h2 className="text-sm font-semibold text-[#2C1A0E] mb-3">
              1. Learning Achievements This Period / Pencapaian Anak Periode Ini
            </h2>
            <textarea
              value={form.summary_achievements}
              onChange={e => setForm(f => ({ ...f, summary_achievements: e.target.value }))}
              rows={5}
              disabled={isLocked}
              placeholder="Write learning achievements / Tulis pencapaian anak..."
              className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] resize-none disabled:bg-gray-50 disabled:text-[#6B5744]"
            />
          </div>

          {/* Section 2 - Auto populated */}
          <div className="bg-white rounded-lg border border-[#E8D5B7] p-4">
            <h2 className="text-sm font-semibold text-[#2C1A0E] mb-1">
              2. Journal of Activities / Jurnal Kegiatan
            </h2>
            <p className="text-xs text-[#6B5744] mb-3">Auto-filled from sessions this period / Otomatis dari sesi periode ini</p>
            {report.sessions.length === 0 ? (
              <p className="text-xs text-[#6B5744] py-4 text-center">
                Tidak ada sesi tercatat dalam periode ini.
              </p>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-xs min-w-[480px]">
                  <thead>
                    <tr className="border-b border-[#E8D5B7]">
                      <th className="text-left py-2 px-1 font-medium text-[#6B5744] w-[20%]">
                        Session (Date)
                      </th>
                      <th className="text-left py-2 px-1 font-medium text-[#6B5744] w-[30%]">
                        Activity / Kegiatan
                      </th>
                      <th className="text-left py-2 px-1 font-medium text-[#6B5744] w-[50%]">
                        Observation Results / Hasil Observasi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.sessions.map((session, i) => (
                      <tr key={session.id} className="border-b border-[#E8D5B7] last:border-0">
                        <td className="py-2.5 px-1 text-[#6B5744] align-top">
                          <span className="font-medium">Sesi {i + 1}</span>
                          <br />
                          <span className="text-[#6B5744]">{formatDate(session.date)}</span>
                        </td>
                        <td className="py-2.5 px-1 text-[#2C1A0E] align-top">{session.activity}</td>
                        <td className="py-2.5 px-1 text-[#2C1A0E] align-top">{session.observation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-lg border border-[#E8D5B7] p-4">
            <h2 className="text-sm font-semibold text-[#2C1A0E] mb-3">
              3. Overall Development Observation / Observasi Perkembangan Umum
            </h2>
            <textarea
              value={form.summary_general}
              onChange={e => setForm(f => ({ ...f, summary_general: e.target.value }))}
              rows={5}
              disabled={isLocked}
              placeholder="Write overall observation / Tulis observasi perkembangan..."
              className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] resize-none disabled:bg-gray-50 disabled:text-[#6B5744]"
            />
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-lg border border-[#E8D5B7] p-4">
            <h2 className="text-sm font-semibold text-[#2C1A0E] mb-3">
              4. Notes for Parents / Catatan untuk Orang Tua
            </h2>
            <textarea
              value={form.summary_parents}
              onChange={e => setForm(f => ({ ...f, summary_parents: e.target.value }))}
              rows={5}
              disabled={isLocked}
              placeholder="Write notes for parents / Tulis catatan untuk orang tua..."
              className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] resize-none disabled:bg-gray-50 disabled:text-[#6B5744]"
            />
          </div>

          {/* Actions */}
          {!isLocked && (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#F5A623] text-[#2C1A0E] font-bold py-3 rounded-lg text-sm hover:bg-[#E09615] disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Report'}
              </button>

              <button
                onClick={handleMarkDone}
                disabled={markingDone}
                className="w-full bg-[#2C1A0E] text-white font-bold py-3 rounded-lg text-sm hover:bg-[#3d2512] disabled:opacity-50 transition-colors"
              >
                {markingDone ? 'Processing...' : 'Mark as Done'}
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  )
}