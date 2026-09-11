'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MentorNav from '@/components/MentorNav'

interface Student {
  id: string
  name: string
  program: string
}

interface Mentor {
  id: string
  name: string
  status: string
}

export default function NewSessionPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [students, setStudents] = useState<Student[]>([])
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoPath, setPhotoPath] = useState<string | null>(null)
  const [photoName, setPhotoName] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    student_id: '',
    mentor_id: '',
    date: today,
    attendance: 'Present',
    activity: '',
    observation: '',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/students').then(r => r.json()),
      fetch('/api/mentors').then(r => r.json()),
    ]).then(([s, m]: [Student[], Mentor[]]) => {
      setStudents(s)
      setMentors((m as Mentor[]).filter(x => x.status === 'active'))
    }).finally(() => setLoading(false))
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(fe => ({ ...fe, [name]: '' }))
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Upload failed / Upload gagal')
        return
      }
      setPhotoPath(data.path)
      setPhotoName(file.name)
    } catch {
      setError('Upload failed / Upload gagal')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors: Record<string, string> = {}
    if (!form.student_id) errors.student_id = 'Select a student first / Pilih siswa terlebih dahulu'
    if (!form.mentor_id) errors.mentor_id = 'Select a mentor / Pilih mentor'
    if (!form.date) errors.date = 'Date is required / Tanggal wajib diisi'
    if (!form.attendance) errors.attendance = 'Select attendance / Pilih kehadiran'
    if (!form.activity.trim()) errors.activity = 'Activity is required / Aktivitas wajib diisi'
    if (!form.observation.trim()) errors.observation = 'Observation is required / Observasi wajib diisi'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, photo_path: photoPath }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save session / Gagal menyimpan sesi')
        return
      }

      router.push('/sessions?success=true')
    } catch {
      setError('Failed to save session / Gagal menyimpan sesi')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF8] text-[#6B5744]">
        <div className="w-10 h-10 border-4 border-[#E8D5B7] border-t-[#F5A623] rounded-full animate-spin mb-4 shadow-sm" />
        <p className="text-[14px] font-bold tracking-wide">Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2C1A0E]">
      <MentorNav />
      <div className="max-w-xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/sessions" className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-[#E8D5B7]/60 text-[#6B5744] shadow-sm hover:shadow hover:text-[#2C1A0E] transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#2C1A0E] tracking-tight">New Session Recap</h1>
            <p className="text-[13px] font-medium text-[#6B5744] mt-0.5">Fill in after the session ends / Isi form setelah sesi selesai</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50/50 backdrop-blur-sm border border-red-200/50 rounded-2xl text-[13px] font-medium text-red-700 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 p-6 sm:p-8 space-y-6">
          {/* Student */}
          <div>
            <label className="block text-[13px] font-semibold text-[#2C1A0E] mb-1.5 uppercase tracking-wide">Student / Siswa</label>
            <div className="relative">
              <select
                name="student_id"
                value={form.student_id}
                onChange={handleChange}
                className={`appearance-none w-full bg-[#FAFAF8] border rounded-xl px-4 py-3.5 pr-10 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:bg-white transition-all ${fieldErrors.student_id ? 'border-red-400' : 'border-[#E8D5B7]/60 focus:border-[#F5A623]'}`}
              >
                <option value="">— Select Student / Pilih Siswa —</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#6B5744]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            {fieldErrors.student_id && <p className="mt-1.5 text-[13px] font-medium text-red-600">{fieldErrors.student_id}</p>}
          </div>

          {/* Mentor */}
          <div>
            <label className="block text-[13px] font-semibold text-[#2C1A0E] mb-1.5 uppercase tracking-wide">Mentor</label>
            <div className="relative">
              <select
                name="mentor_id"
                value={form.mentor_id}
                onChange={handleChange}
                className={`appearance-none w-full bg-[#FAFAF8] border rounded-xl px-4 py-3.5 pr-10 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:bg-white transition-all ${fieldErrors.mentor_id ? 'border-red-400' : 'border-[#E8D5B7]/60 focus:border-[#F5A623]'}`}
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
            {fieldErrors.mentor_id && <p className="mt-1.5 text-[13px] font-medium text-red-600">{fieldErrors.mentor_id}</p>}
          </div>

          {/* Date + Attendance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#2C1A0E] mb-1.5 uppercase tracking-wide">Date / Tanggal</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className={`w-full bg-[#FAFAF8] border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:bg-white transition-all ${fieldErrors.date ? 'border-red-400' : 'border-[#E8D5B7]/60 focus:border-[#F5A623]'}`}
              />
              {fieldErrors.date && <p className="mt-1.5 text-[13px] font-medium text-red-600">{fieldErrors.date}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#2C1A0E] mb-1.5 uppercase tracking-wide">Attendance / Kehadiran</label>
              <div className="relative">
                <select
                  name="attendance"
                  value={form.attendance}
                  onChange={handleChange}
                  className={`appearance-none w-full bg-[#FAFAF8] border rounded-xl px-4 py-3.5 pr-10 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:bg-white transition-all ${fieldErrors.attendance ? 'border-red-400' : 'border-[#E8D5B7]/60 focus:border-[#F5A623]'}`}
                >
                  <option value="Present">Present / Hadir</option>
                  <option value="Absent">Absent / Tidak Hadir</option>
                  <option value="Reschedule">Reschedule</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#6B5744]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              {fieldErrors.attendance && <p className="mt-1.5 text-[13px] font-medium text-red-600">{fieldErrors.attendance}</p>}
            </div>
          </div>

          {/* Activity */}
          <div>
            <label className="block text-[13px] font-semibold text-[#2C1A0E] mb-1.5 uppercase tracking-wide">
              Activity / Aktivitas{' '}
              <span className="text-[#B0957A] normal-case tracking-normal ml-1">(1 sentence / kalimat)</span>
            </label>
            <textarea
              name="activity"
              value={form.activity}
              onChange={handleChange}
              rows={3}
              placeholder="What was done in this session? / Apa yang dilakukan dalam sesi ini?"
              className={`w-full bg-[#FAFAF8] border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:bg-white resize-none transition-all placeholder:text-[#B0957A] ${fieldErrors.activity ? 'border-red-400' : 'border-[#E8D5B7]/60 focus:border-[#F5A623]'}`}
            />
            {fieldErrors.activity && <p className="mt-1.5 text-[13px] font-medium text-red-600">{fieldErrors.activity}</p>}
          </div>

          {/* Observation */}
          <div>
            <label className="block text-[13px] font-semibold text-[#2C1A0E] mb-1.5 uppercase tracking-wide">
              Observation / Observasi{' '}
              <span className="text-[#B0957A] normal-case tracking-normal ml-1">(1 paragraph, 1-6 sentences / kalimat)</span>
            </label>
            <textarea
              name="observation"
              value={form.observation}
              onChange={handleChange}
              rows={4}
              placeholder="How was the student's development and response? / Bagaimana perkembangan, performa, dan respons siswa dalam sesi ini?"
              className={`w-full bg-[#FAFAF8] border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:bg-white resize-none transition-all placeholder:text-[#B0957A] ${fieldErrors.observation ? 'border-red-400' : 'border-[#E8D5B7]/60 focus:border-[#F5A623]'}`}
            />
            {fieldErrors.observation && <p className="mt-1.5 text-[13px] font-medium text-red-600">{fieldErrors.observation}</p>}
          </div>

          {/* Photo */}
          <div>
            <label className="block text-[13px] font-semibold text-[#2C1A0E] mb-1.5 uppercase tracking-wide">
              Session Photo / Foto Sesi{' '}
              <span className="text-[#B0957A] normal-case tracking-normal ml-1">(optional / opsional)</span>
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-[#FAFAF8] border-2 border-dashed border-[#E8D5B7] rounded-xl p-6 text-center hover:bg-white hover:border-[#F5A623]/60 transition-colors group"
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-3 text-[15px] font-medium text-[#6B5744]">
                  <div className="w-5 h-5 border-2 border-[#E8D5B7] border-t-[#F5A623] rounded-full animate-spin" />
                  Uploading...
                </div>
              ) : photoName ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-[14px] font-medium text-green-700">{photoName}</span>
                  <span className="text-[12px] text-green-600/70">Tap to replace</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#6B5744] group-hover:text-[#2C1A0E] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#E8D5B7]/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <span className="text-[14px] font-semibold block">Tap to select photo</span>
                    <span className="text-[13px] text-[#B0957A]">JPG, PNG, or WEBP</span>
                  </div>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full bg-[#F5A623] text-[#2C1A0E] font-bold py-3.5 rounded-xl text-[15px] shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-[#F6AF3C] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm disabled:cursor-not-allowed transition-all duration-200"
            >
              {submitting ? 'Saving... / Menyimpan...' : 'Save Session Recap / Simpan Rekap Sesi'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
