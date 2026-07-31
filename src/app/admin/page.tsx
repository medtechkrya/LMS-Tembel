'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminNav from './_nav'

interface Student {
  id: string
  name: string
  program: string
}

interface Report {
  id: string
  student_id: string
  period_start: string
  status: string
}

function getCurrentPeriod(): { start: Date; end: Date } {
  const now = new Date()
  const day = now.getDate()
  if (day >= 26) {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 26),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 25),
    }
  }
  return {
    start: new Date(now.getFullYear(), now.getMonth() - 1, 26),
    end: new Date(now.getFullYear(), now.getMonth(), 25),
  }
}

function formatPeriod(start: Date, end: Date): string {
  const s = start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  const e = end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${s} – ${e}`
}

const STATUS_LABEL: Record<string, string> = { draft: 'Draft', done: 'Done', sent: 'Sent' }
const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-[#FFF3CD] text-[#856404]',
  done: 'bg-[#D4EDDA] text-[#155724]',
  sent: 'bg-[#CCE5FF] text-[#004085]',
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [mentorCount, setMentorCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/students').then(r => r.json()),
      fetch('/api/reports').then(r => r.json()),
      fetch('/api/mentors').then(r => r.json()),
    ]).then(([s, r, m]) => {
      setStudents(s)
      setReports(r)
      setMentorCount(m.length)
    }).finally(() => setLoading(false))
  }, [])

  const { start: periodStart } = getCurrentPeriod()

  function getReport(studentId: string): Report | null {
    return reports.find(r => {
      const rs = new Date(r.period_start)
      return r.student_id === studentId &&
        rs.getFullYear() === periodStart.getFullYear() &&
        rs.getMonth() === periodStart.getMonth() &&
        rs.getDate() === periodStart.getDate()
    }) ?? null
  }

  const periodReports = reports.filter(r => {
    const rs = new Date(r.period_start)
    return rs.getFullYear() === periodStart.getFullYear() &&
      rs.getMonth() === periodStart.getMonth() &&
      rs.getDate() === periodStart.getDate()
  })

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <AdminNav />
      <main className="flex-1 p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-[#2C1A0E] mb-1">Admin Dashboard</h1>
        <p className="text-sm text-[#6B5744] mb-8">
          Period: {formatPeriod(periodStart, getCurrentPeriod().end)}
        </p>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Students', value: students.length, href: '/admin/students' },
            { label: 'Mentors', value: mentorCount, href: '/admin/mentors' },
            { label: 'Reports This Period', value: periodReports.length, href: '/admin/reports' },
          ].map(card => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-xl border border-[#E8D5B7] p-5 hover:border-[#F5A623] transition-colors"
            >
              <p className="text-3xl font-bold text-[#2C1A0E]">{loading ? '—' : card.value}</p>
              <p className="text-sm text-[#6B5744] mt-1">{card.label}</p>
            </Link>
          ))}
        </div>

        {/* Student report status */}
        <div className="bg-white rounded-xl border border-[#E8D5B7]">
          <div className="px-5 py-4 border-b border-[#E8D5B7]">
            <h2 className="font-semibold text-[#2C1A0E] text-sm">Current Period — Report Status</h2>
          </div>
          {loading ? (
            <p className="text-sm text-[#6B5744] p-5">Loading...</p>
          ) : (
            <div className="divide-y divide-[#E8D5B7]">
              {students.map(student => {
                const report = getReport(student.id)
                const status = report?.status ?? null
                return (
                  <div key={student.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-[#2C1A0E]">{student.name}</p>
                      <p className="text-xs text-[#6B5744]">{student.program}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${status ? (STATUS_STYLE[status] ?? 'bg-gray-100 text-gray-500') : 'bg-gray-100 text-gray-500'}`}>
                        {status ? (STATUS_LABEL[status] ?? status) : 'Not Generated'}
                      </span>
                      {report && (
                        <Link href={`/reports/${report.id}`} className="text-xs text-[#F5A623] hover:underline">
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="flex gap-3 mt-6">
          <Link href="/admin/students" className="text-sm text-[#F5A623] hover:underline">Manage Students</Link>
          <span className="text-[#E8D5B7]">·</span>
          <Link href="/admin/mentors" className="text-sm text-[#F5A623] hover:underline">Manage Mentors</Link>
          <span className="text-[#E8D5B7]">·</span>
          <Link href="/admin/reports" className="text-sm text-[#F5A623] hover:underline">View Reports</Link>
        </div>
      </main>
    </div>
  )
}
