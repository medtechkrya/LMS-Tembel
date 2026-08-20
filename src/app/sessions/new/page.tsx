'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      // leave student_id empty so user must explicitly choose
      // leave mentor_id empty so user must explicitly choose
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
        setError(data.error || 'Upload gagal')
        return
      }
      setPhotoPath(data.path)
      setPhotoName(file.name)
    } catch {
      setError('Upload gagal')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors: Record<string, string> = {}
    if (!form.student_id) errors.student_id = 'Pilih siswa terlebih dahulu'
    if (!form.mentor_id) errors.mentor_id = 'Pilih mentor'
    if (!form.date) errors.date = 'Tanggal wajib diisi'
    if (!form.attendance) errors.attendance = 'Pilih kehadiran'
    if (!form.activity.trim()) errors.activity = 'Aktivitas wajib diisi'
    if (!form.observation.trim()) errors.observation = 'Observasi wajib diisi'

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
        setError(data.error || 'Gagal menyimpan sesi')
        return
      }

      router.push('/sessions?success=true')
    } catch {
      setError('Gagal menyimpan sesi')
    } finally {
      setSubmitting(false)
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
          <Link href="/sessions" className="text-sm font-semibold text-[#F5A623]">Sesi</Link>
          <Link href="/reports" className="text-sm text-[#2C1A0E]/60 hover:text-[#2C1A0E] transition-colors">Laporan</Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/sessions" className="text-[#6B5744] hover:text-[#2C1A0E]">
            ←
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-[#2C1A0E]">Rekap Sesi Baru</h1>
            <p className="text-sm text-[#6B5744]">Isi form setelah sesi selesai</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Student */}
          <div>
            <label className="block text-sm font-medium text-[#2C1A0E] mb-1">Siswa</label>
            <select
              name="student_id"
              value={form.student_id}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] ${fieldErrors.student_id ? 'border-red-400' : 'border-[#E8D5B7]'}`}
            >
              <option value="">— Pilih Siswa —</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {fieldErrors.student_id && <p className="mt-1 text-xs text-red-600">{fieldErrors.student_id}</p>}
          </div>

          {/* Mentor */}
          <div>
            <label className="block text-sm font-medium text-[#2C1A0E] mb-1">Mentor</label>
            <select
              name="mentor_id"
              value={form.mentor_id}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] ${fieldErrors.mentor_id ? 'border-red-400' : 'border-[#E8D5B7]'}`}
            >
              <option value="">— Pilih mentor —</option>
              {mentors.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {fieldErrors.mentor_id && <p className="mt-1 text-xs text-red-600">{fieldErrors.mentor_id}</p>}
          </div>

          {/* Date + Attendance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#2C1A0E] mb-1">Tanggal</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] ${fieldErrors.date ? 'border-red-400' : 'border-[#E8D5B7]'}`}
              />
              {fieldErrors.date && <p className="mt-1 text-xs text-red-600">{fieldErrors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C1A0E] mb-1">Kehadiran</label>
              <select
                name="attendance"
                value={form.attendance}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] ${fieldErrors.attendance ? 'border-red-400' : 'border-[#E8D5B7]'}`}
              >
                <option value="Present">Hadir</option>
                <option value="Absent">Tidak Hadir</option>
                <option value="Reschedule">Reschedule</option>
              </select>
              {fieldErrors.attendance && <p className="mt-1 text-xs text-red-600">{fieldErrors.attendance}</p>}
            </div>
          </div>

          {/* Activity */}
          <div>
            <label className="block text-sm font-medium text-[#2C1A0E] mb-1">
              Aktivitas{' '}
              <span className="text-[#6B5744] font-normal text-xs">(1 kalimat)</span>
            </label>
            <textarea
              name="activity"
              value={form.activity}
              onChange={handleChange}
              rows={3}
              placeholder="Apa yang dilakukan dalam sesi ini?"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] resize-none ${fieldErrors.activity ? 'border-red-400' : 'border-[#E8D5B7]'}`}
            />
            {fieldErrors.activity && <p className="mt-1 text-xs text-red-600">{fieldErrors.activity}</p>}
          </div>

          {/* Observation */}
          <div>
            <label className="block text-sm font-medium text-[#2C1A0E] mb-1">
              Observasi{' '}
              <span className="text-[#6B5744] font-normal text-xs">(1 paragraf, 1-6 kalimat)</span>
            </label>
            <textarea
              name="observation"
              value={form.observation}
              onChange={handleChange}
              rows={3}
              placeholder="Bagaimana perkembangan, performa, dan respons siswa dalam sesi ini?"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] resize-none ${fieldErrors.observation ? 'border-red-400' : 'border-[#E8D5B7]'}`}
            />
            {fieldErrors.observation && <p className="mt-1 text-xs text-red-600">{fieldErrors.observation}</p>}
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-[#2C1A0E] mb-1">
              Foto Sesi{' '}
              <span className="text-[#6B5744] font-normal text-xs">(opsional)</span>
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-[#E8D5B7] rounded-lg p-4 text-center hover:border-[#F5A623] transition-colors"
            >
              {uploading ? (
                <span className="text-sm text-[#6B5744]">Mengupload...</span>
              ) : photoName ? (
                <span className="text-sm text-green-600">✓ {photoName}</span>
              ) : (
                <span className="text-sm text-[#6B5744]">Ketuk untuk pilih foto (JPG, PNG, WEBP)</span>
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
          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full bg-[#F5A623] text-[#2C1A0E] font-bold py-3 rounded-lg text-sm hover:bg-[#E09615] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Rekap Sesi'}
          </button>
        </form>

      </div>
    </div>
  )
}
