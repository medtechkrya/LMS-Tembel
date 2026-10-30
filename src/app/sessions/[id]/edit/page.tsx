'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import MentorNav from '@/components/MentorNav'
import LoadingState from '@/components/LoadingState'

interface Student {
  id: string
  name: string
  program: string
}

interface LoggedInMentor {
  id: string
  name: string
  photo_path?: string | null
}

interface SessionData {
  id: string
  student_id: string
  mentor_id: string | null
  date: string
  attendance: string
  activity: string
  observation: string
  photo_path: string | null
  student: { id: string; name: string }
  mentor: { id: string; name: string } | null
}

export default function EditSessionPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [students, setStudents] = useState<Student[]>([])
  const [currentMentor, setCurrentMentor] = useState<LoggedInMentor | null>(null)
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoPath, setPhotoPath] = useState<string | null>(null)
  const [photoName, setPhotoName] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    student_id: '',
    date: '',
    attendance: 'Present',
    activity: '',
    observation: '',
  })

  useEffect(() => {
    Promise.all([
      fetch(`/api/sessions/${id}`).then(r => (r.ok ? r.json() : null)),
      fetch('/api/students').then(r => r.json()),
      fetch('/api/mentor-me').then(r => (r.ok ? r.json() : null)),
    ])
      .then(([sess, s, me]: [SessionData | null, Student[], LoggedInMentor | null]) => {
        if (!me?.id) {
          window.location.href = '/mentor-login'
          return
        }
        setCurrentMentor(me)
        setStudents(s || [])

        if (!sess) {
          setError('Session not found')
          return
        }

        setSession(sess)
        const dateStr = sess.date ? new Date(sess.date).toISOString().split('T')[0] : ''
        setForm({
          student_id: sess.student_id || '',
          date: dateStr,
          attendance: sess.attendance || 'Present',
          activity: sess.activity || '',
          observation: sess.observation || '',
        })
        setPhotoPath(sess.photo_path)
      })
      .catch(() => setError('Failed to load session data'))
      .finally(() => setLoading(false))
  }, [id])

  const isAuthor = Boolean(
    currentMentor?.id && session?.mentor_id && currentMentor.id === session.mentor_id
  )

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

    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = event => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 2000
          const MAX_HEIGHT = 2000
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            async blob => {
              if (!blob) {
                setError('Failed to compress image')
                setUploading(false)
                return
              }
              const fd = new FormData()
              const safeName = file.name.replace(/[^a-zA-Z0-9]/g, '_')
              fd.append('file', new File([blob], safeName + '.webp', { type: 'image/webp' }))

              try {
                const res = await fetch('/api/upload', { method: 'POST', body: fd })
                const data = await res.json()
                if (!res.ok) {
                  setError(data.error || 'Upload failed')
                  return
                }
                setPhotoPath(data.path)
                setPhotoName(file.name)
                setFieldErrors(fe => ({ ...fe, photo: '' }))
              } catch {
                setError('Upload failed')
              } finally {
                setUploading(false)
              }
            },
            'image/webp',
            0.8
          )
        }
        img.onerror = () => {
          setError('Invalid image file')
          setUploading(false)
        }
      }
      reader.onerror = () => {
        setError('Failed to read image file')
        setUploading(false)
      }
    } catch {
      setError('Upload failed')
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthor) return

    const errors: Record<string, string> = {}
    if (!form.student_id) errors.student_id = 'Select a student'
    if (!form.date) errors.date = 'Date is required'
    if (!form.attendance) errors.attendance = 'Select attendance'
    if (!form.activity.trim()) errors.activity = 'Activity is required'
    if (!form.observation.trim()) errors.observation = 'Observation is required'
    if (!photoPath) errors.photo = 'Session photo is required'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          photo_path: photoPath,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to update session')
        return
      }

      router.push('/sessions?updated=true')
    } catch {
      setError('Failed to update session')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-[#2C1A0E]">
        <MentorNav />
        <LoadingState className="py-32" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2C1A0E]">
      <MentorNav />
      <div className="max-w-xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/sessions"
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-[#E8D5B7]/60 text-[#6B5744] shadow-sm hover:shadow hover:text-[#2C1A0E] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#2C1A0E] tracking-tight">Edit Session Recap</h1>
            <p className="text-[13px] font-medium text-[#6B5744] mt-0.5">
              Modify session details and fix typos
            </p>
          </div>
        </div>

        {/* View-Only warning if not author */}
        {!isAuthor && (
          <div className="mb-6 p-4 bg-amber-50/90 border border-amber-200 rounded-2xl text-[13px] text-amber-800 flex items-start gap-3 shadow-sm">
            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-bold">View-Only Mode</p>
              <p className="mt-0.5 leading-relaxed text-amber-700">
                This session was logged by <strong className="text-amber-900">{session?.mentor?.name || 'another mentor'}</strong>. You can only edit session recaps that you created.
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="sticky top-16 z-30 mb-6 p-4 bg-red-50/95 backdrop-blur-sm border border-red-200 rounded-2xl text-[13px] font-medium text-red-700 shadow-sm flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-700 font-bold px-1.5"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 p-6 sm:p-8 space-y-6">
          {/* Student */}
          <div>
            <label className="block text-[13px] font-semibold text-[#2C1A0E] mb-1.5 uppercase tracking-wide">
              Student *
            </label>
            <div className="relative">
              <select
                name="student_id"
                value={form.student_id}
                onChange={handleChange}
                disabled={!isAuthor}
                className={`appearance-none w-full bg-[#FAFAF8] border rounded-xl px-4 py-3.5 pr-10 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:bg-white transition-all disabled:opacity-75 disabled:cursor-not-allowed ${
                  fieldErrors.student_id ? 'border-red-400' : 'border-[#E8D5B7]/60 focus:border-[#F5A623]'
                }`}
              >
                <option value="">— Select Student —</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#6B5744]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {fieldErrors.student_id && <p className="mt-1.5 text-[13px] font-medium text-red-600">{fieldErrors.student_id}</p>}
          </div>

          {/* Mentor (Locked) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[13px] font-semibold text-[#2C1A0E] uppercase tracking-wide">
                Mentor
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8a7662]">
                <svg className="w-3.5 h-3.5 text-[#F5A623]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Assigned Mentor
              </span>
            </div>
            <div className="w-full bg-[#FAFAF8] border border-[#E8D5B7]/60 rounded-xl px-4 py-3.5 text-[15px] font-semibold text-[#2C1A0E] flex items-center justify-between select-none opacity-90">
              <span>{session?.mentor?.name || currentMentor?.name || '—'}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F5A623]/15 text-[#6B5744]">
                Locked
              </span>
            </div>
          </div>

          {/* Date + Attendance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#2C1A0E] mb-1.5 uppercase tracking-wide">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                disabled={!isAuthor}
                className={`w-full bg-[#FAFAF8] border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:bg-white transition-all disabled:opacity-75 disabled:cursor-not-allowed ${
                  fieldErrors.date ? 'border-red-400' : 'border-[#E8D5B7]/60 focus:border-[#F5A623]'
                }`}
              />
              {fieldErrors.date && <p className="mt-1.5 text-[13px] font-medium text-red-600">{fieldErrors.date}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#2C1A0E] mb-1.5 uppercase tracking-wide">
                Attendance *
              </label>
              <div className="relative">
                <select
                  name="attendance"
                  value={form.attendance}
                  onChange={handleChange}
                  disabled={!isAuthor}
                  className={`appearance-none w-full bg-[#FAFAF8] border rounded-xl px-4 py-3.5 pr-10 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:bg-white transition-all disabled:opacity-75 disabled:cursor-not-allowed ${
                    fieldErrors.attendance ? 'border-red-400' : 'border-[#E8D5B7]/60 focus:border-[#F5A623]'
                  }`}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Reschedule">Reschedule</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#6B5744]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {fieldErrors.attendance && <p className="mt-1.5 text-[13px] font-medium text-red-600">{fieldErrors.attendance}</p>}
            </div>
          </div>

          {/* Activity */}
          <div>
            <label className="block text-[13px] font-semibold text-[#2C1A0E] mb-1.5 uppercase tracking-wide">
              Activity *{' '}
              <span className="text-[#B0957A] normal-case tracking-normal ml-1">(1-2 sentences)</span>
            </label>
            <textarea
              name="activity"
              value={form.activity}
              onChange={handleChange}
              disabled={!isAuthor}
              rows={3}
              placeholder={
                form.attendance === 'Absent'
                  ? 'Reason for absence'
                  : form.attendance === 'Reschedule'
                  ? 'Reason for reschedule'
                  : 'What was done in this session?'
              }
              className={`w-full bg-[#FAFAF8] border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:bg-white resize-none transition-all placeholder:text-[#B0957A] disabled:opacity-75 disabled:cursor-not-allowed ${
                fieldErrors.activity ? 'border-red-400' : 'border-[#E8D5B7]/60 focus:border-[#F5A623]'
              }`}
            />
            {fieldErrors.activity && <p className="mt-1.5 text-[13px] font-medium text-red-600">{fieldErrors.activity}</p>}
          </div>

          {/* Observation */}
          <div>
            <label className="block text-[13px] font-semibold text-[#2C1A0E] mb-1.5 uppercase tracking-wide">
              Observation *{' '}
              <span className="text-[#B0957A] normal-case tracking-normal ml-1">
                (1 paragraph, 2-6 sentences)
              </span>
            </label>
            <textarea
              name="observation"
              value={form.observation}
              onChange={handleChange}
              disabled={!isAuthor}
              rows={4}
              placeholder={
                form.attendance === 'Absent'
                  ? 'Follow-up or notes'
                  : form.attendance === 'Reschedule'
                  ? 'Reschedule plan or notes'
                  : "How was the student's development, performance, and response in this session?"
              }
              className={`w-full bg-[#FAFAF8] border rounded-xl px-4 py-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:bg-white resize-none transition-all placeholder:text-[#B0957A] disabled:opacity-75 disabled:cursor-not-allowed ${
                fieldErrors.observation ? 'border-red-400' : 'border-[#E8D5B7]/60 focus:border-[#F5A623]'
              }`}
            />
            {fieldErrors.observation && <p className="mt-1.5 text-[13px] font-medium text-red-600">{fieldErrors.observation}</p>}
          </div>

          {/* Photo */}
          <div>
            <label className="block text-[13px] font-semibold text-[#2C1A0E] mb-1 uppercase tracking-wide">
              Session Photo <span className="text-red-500">*</span>
            </label>
            <p className="text-[12px] text-[#6B5744] mb-3">
              {form.attendance === 'Absent'
                ? 'Upload your attendance photo as proof of student absence.'
                : form.attendance === 'Reschedule'
                ? 'Upload reschedule proof (e.g. chat screenshot).'
                : 'Class session documentation photo with student.'}
            </p>

            {photoPath && (
              <div className="mb-4 flex items-center gap-4 p-3.5 bg-[#FAFAF8] border border-[#E8D5B7]/60 rounded-2xl">
                <img
                  src={photoPath}
                  alt="Current session photo"
                  className="w-16 h-16 object-cover rounded-xl border border-black/10 shadow-sm shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#2C1A0E] truncate">
                    {photoName ? photoName : 'Current Session Photo'}
                  </p>
                  <p className="text-[11px] text-[#8a7662]">
                    {photoName ? 'New photo selected' : 'Saved photo'}
                  </p>
                </div>
                {isAuthor && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#2C1A0E] bg-white border border-[#E8D5B7] rounded-xl hover:bg-[#E8D5B7]/20 transition-all shrink-0 shadow-sm"
                  >
                    Change Photo
                  </button>
                )}
              </div>
            )}

            {isAuthor && !photoPath && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full bg-[#FAFAF8] border-2 border-dashed rounded-xl p-6 text-center hover:bg-white transition-colors group ${
                  fieldErrors.photo ? 'border-red-400 hover:border-red-500' : 'border-[#E8D5B7] hover:border-[#F5A623]/60'
                }`}
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-3 text-[15px] font-medium text-[#6B5744]">
                    <div className="w-5 h-5 border-2 border-[#E8D5B7] border-t-[#F5A623] rounded-full animate-spin" />
                    Uploading...
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#6B5744] group-hover:text-[#2C1A0E] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#E8D5B7]/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[14px] font-semibold block">Tap to select photo *</span>
                      <span className="text-[13px] text-[#B0957A]">JPG, PNG, or WEBP</span>
                    </div>
                  </div>
                )}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
            {fieldErrors.photo && <p className="mt-1.5 text-[13px] font-medium text-red-600">{fieldErrors.photo}</p>}
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/sessions"
              className="w-full sm:w-1/3 text-center py-3.5 px-4 rounded-xl border border-[#E8D5B7]/80 bg-white text-[#6B5744] text-[15px] font-semibold hover:bg-[#FAFAF8] hover:text-[#2C1A0E] transition-all"
            >
              Cancel
            </Link>
            {isAuthor && (
              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full sm:w-2/3 bg-[#F5A623] text-[#2C1A0E] font-bold py-3.5 rounded-xl text-[15px] shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-[#F6AF3C] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm disabled:cursor-not-allowed transition-all duration-200"
              >
                {submitting ? 'Updating...' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
