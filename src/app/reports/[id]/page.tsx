'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import MentorNav from '@/components/MentorNav'
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

  const saveReport = async (extraData?: object) => {
    const res = await fetch(`/api/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, mentor_id: form.mentor_id || null, ...extraData }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to save')
    }
    return res
  }

  const handleSave = async () => {
    if (isLocked) return
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await saveReport()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save / Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const handleMarkDone = async () => {
    const missing: string[] = []
    if (!form.mentor_id) missing.push('Mentor')
    if (!form.summary_achievements.trim()) missing.push('Learning Achievements')
    if (!form.summary_general.trim()) missing.push('Overall Development Observation')
    if (!form.summary_parents.trim()) missing.push('Notes for Parents')

    if (missing.length > 0) {
      const list = missing.join(', ')
      setError(`Please fill all required fields before submitting / Harap isi semua bagian sebelum menyelesaikan laporan: ${list}`)
      return
    }

    if (!confirm('Mark this report as Done? Editing will be disabled. / Tandai laporan ini sebagai Selesai? Pengeditan akan dinonaktifkan.')) return

    setMarkingDone(true)
    setError('')
    try {
      await saveReport({ status: 'done' })
      setReport(r => r ? { ...r, status: 'done' } : r)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed / Gagal')
    } finally {
      setMarkingDone(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF8] text-[#6B5744]">
        <div className="w-10 h-10 border-4 border-[#E8D5B7] border-t-[#F5A623] rounded-full animate-spin mb-4 shadow-sm" />
        <p className="text-[14px] font-bold tracking-wide">Loading report...</p>
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
    <div className="min-h-screen bg-[#FAFAF8] text-[#2C1A0E]">
      <MentorNav />
      <div className="max-w-3xl mx-auto py-8 px-5">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/reports" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#E8D5B7]/40 text-[#6B5744] hover:text-[#F5A623] hover:border-[#F5A623]/40 hover:-translate-x-1 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/Logo-Teman-Belajar.png" alt="Teman Belajar" className="h-7" />
            <div className="w-px h-4 bg-[#E8D5B7] rounded" />
            <img src="/krya-logo.png" alt="Krya" className="h-6" />
          </div>
          <div className="ml-2">
            <h1 className="text-xl font-bold text-[#2C1A0E] tracking-tight leading-tight">Monthly Report</h1>
            <p className="text-[13px] font-medium text-[#6B5744]">
              {report.student.name} <span className="text-[#E8D5B7] mx-1">|</span> {formatPeriod(report.period_start, report.period_end)}
            </p>
          </div>
        </div>

        {isLocked && (
          <div className="mb-6 p-4 bg-[#FFF3CD]/80 backdrop-blur-sm border border-[#E8D5B7] rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5 text-[#856404] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <div>
              <p className="text-[14px] font-bold text-[#856404]">Report Submitted</p>
              <p className="text-[13px] font-medium text-[#856404]/80">This report has been finalized. Contact admin to make changes.<br/>Laporan ini sudah dikirim. Hubungi admin untuk melakukan perubahan.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl text-[13px] font-medium text-red-700 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}
        {saved && (
          <div className="mb-6 p-4 bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-2xl text-[13px] font-bold text-green-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Saved! / Tersimpan!
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5A623]/5 rounded-bl-full -z-10" />
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold tracking-wider uppercase text-[#B0957A] mb-2">
                  Mentor <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.mentor_id}
                    onChange={e => setForm(f => ({ ...f, mentor_id: e.target.value }))}
                    disabled={isLocked}
                    className="appearance-none w-full bg-[#FAFAF8] border border-[#E8D5B7]/60 rounded-xl px-4 py-3 pr-10 text-[14px] font-medium text-[#2C1A0E] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] focus:bg-white transition-all disabled:bg-gray-50/50 disabled:text-[#6B5744] disabled:opacity-70"
                  >
                    <option value="">— Select Mentor / Pilih Mentor —</option>
                    {mentors.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#6B5744]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
                <div className="bg-[#FAFAF8] p-4 rounded-2xl border border-[#E8D5B7]/40">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-[#B0957A]">Period / Periode</p>
                  <p className="font-bold text-[#2C1A0E] mt-1">
                    {formatPeriod(report.period_start, report.period_end)}
                  </p>
                </div>
                <div className="bg-[#FAFAF8] p-4 rounded-2xl border border-[#E8D5B7]/40">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-[#B0957A]">Student&apos;s Name</p>
                  <p className="font-bold text-[#2C1A0E] mt-1">{report.student.name}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 p-6">
            <h2 className="text-[15px] font-bold text-[#2C1A0E] mb-3">
              1. Learning Achievements This Period / Pencapaian Anak Periode Ini <span className="text-red-500">*</span>
            </h2>
            <textarea
              value={form.summary_achievements}
              onChange={e => setForm(f => ({ ...f, summary_achievements: e.target.value }))}
              rows={5}
              disabled={isLocked}
              placeholder="Write learning achievements / Tulis pencapaian anak..."
              className="w-full bg-[#FAFAF8] border border-[#E8D5B7]/60 rounded-2xl px-4 py-3 text-[14px] leading-relaxed text-[#2C1A0E] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] focus:bg-white resize-none transition-all disabled:bg-gray-50/50 disabled:text-[#6B5744] disabled:opacity-70"
            />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 p-6">
            <div className="mb-4">
              <h2 className="text-[15px] font-bold text-[#2C1A0E] mb-1">
                2. Journal of Activities / Jurnal Kegiatan
              </h2>
              <p className="text-[12px] font-medium text-[#B0957A]">Auto-filled from sessions this period / Otomatis dari sesi periode ini</p>
            </div>
            
            {report.sessions.length === 0 ? (
              <div className="bg-[#FAFAF8] rounded-2xl border border-[#E8D5B7]/40 py-8 text-center">
                <p className="text-[13px] font-medium text-[#B0957A]">
                  No sessions recorded in this period.<br/>Tidak ada sesi tercatat dalam periode ini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="border-b border-[#E8D5B7]/40">
                      <th className="py-3 px-2 text-[11px] font-bold tracking-wider text-[#B0957A] uppercase w-[20%]">Session (Date)</th>
                      <th className="py-3 px-2 text-[11px] font-bold tracking-wider text-[#B0957A] uppercase w-[30%]">Activity / Kegiatan</th>
                      <th className="py-3 px-2 text-[11px] font-bold tracking-wider text-[#B0957A] uppercase w-[50%]">Observation Results / Hasil Observasi</th>
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

          <div className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 p-6">
            <h2 className="text-[15px] font-bold text-[#2C1A0E] mb-3">
              3. Overall Development Observation / Observasi Perkembangan Umum <span className="text-red-500">*</span>
            </h2>
            <textarea
              value={form.summary_general}
              onChange={e => setForm(f => ({ ...f, summary_general: e.target.value }))}
              rows={5}
              disabled={isLocked}
              placeholder="Write overall observation / Tulis observasi perkembangan..."
              className="w-full bg-[#FAFAF8] border border-[#E8D5B7]/60 rounded-2xl px-4 py-3 text-[14px] leading-relaxed text-[#2C1A0E] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] focus:bg-white resize-none transition-all disabled:bg-gray-50/50 disabled:text-[#6B5744] disabled:opacity-70"
            />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 p-6">
            <h2 className="text-[15px] font-bold text-[#2C1A0E] mb-3">
              4. Notes for Parents / Catatan untuk Orang Tua <span className="text-red-500">*</span>
            </h2>
            <textarea
              value={form.summary_parents}
              onChange={e => setForm(f => ({ ...f, summary_parents: e.target.value }))}
              rows={5}
              disabled={isLocked}
              placeholder="Write notes for parents / Tulis catatan untuk orang tua..."
              className="w-full bg-[#FAFAF8] border border-[#E8D5B7]/60 rounded-2xl px-4 py-3 text-[14px] leading-relaxed text-[#2C1A0E] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] focus:bg-white resize-none transition-all disabled:bg-gray-50/50 disabled:text-[#6B5744] disabled:opacity-70"
            />
          </div>

          {!isLocked && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 pb-8">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-white text-[#2C1A0E] border border-[#E8D5B7] font-bold py-3.5 rounded-2xl text-[14px] shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-[#FAFAF8] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm transition-all"
              >
                {saving ? 'Saving...' : 'Save Draft / Simpan Draf'}
              </button>

              <button
                onClick={handleMarkDone}
                disabled={markingDone}
                className="w-full bg-[#F5A623] text-[#2C1A0E] font-bold py-3.5 rounded-2xl text-[14px] shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-[#F6AF3C] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {markingDone ? 'Processing...' : 'Submit & Mark as Done'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
