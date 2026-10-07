'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminNav from './_nav'
import { getCurrentPeriod } from '@/lib/period'

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

  const [filter, setFilter] = useState<'all' | 'missing' | 'draft' | 'done' | 'sent'>('all')
  const [searchQuery, setSearchQuery] = useState('')

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

  const currentPeriod = getCurrentPeriod()

  function getReport(studentId: string): Report | null {
    return reports.find(r => {
      const rs = new Date(r.period_start)
      return r.student_id === studentId &&
        rs.getFullYear() === currentPeriod.start.getFullYear() &&
        rs.getMonth() === currentPeriod.start.getMonth() &&
        rs.getDate() === currentPeriod.start.getDate()
    }) ?? null
  }

  const periodReports = reports.filter(r => {
    const rs = new Date(r.period_start)
    return rs.getFullYear() === currentPeriod.start.getFullYear() &&
      rs.getMonth() === currentPeriod.start.getMonth() &&
      rs.getDate() === currentPeriod.start.getDate()
  })

  const filteredStudents = students.filter(student => {
    if (searchQuery && !student.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    const report = getReport(student.id)
    const status = report?.status ?? 'missing'
    if (filter !== 'all' && status !== filter) return false
    return true
  })

  const FilterButton = ({ value, label }: { value: typeof filter, label: string }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
        filter === value 
          ? 'bg-[#2C1A0E] text-white shadow-sm' 
          : 'bg-[#FAFAF8] text-[#6B5744] hover:bg-[#E8D5B7]/30 border border-transparent'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2C1A0E] flex flex-col md:flex-row">
      <AdminNav />
      <main className="flex-1 p-5 md:p-8 overflow-x-hidden">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#2C1A0E] tracking-tight mb-1">Admin Dashboard</h1>
            <p className="text-[13px] font-medium text-[#6B5744]">
              Active Period: <span className="text-[#2C1A0E]">{currentPeriod.label}</span>
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Students', value: students.length, href: '/admin/students', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Mentors', value: mentorCount, href: '/admin/mentors', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Reports This Period', value: periodReports.length, href: '/admin/reports', color: 'text-[#F5A623]', bg: 'bg-[#F5A623]/10' },
          ].map(card => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 p-6 hover:shadow-md hover:-translate-y-0.5 hover:border-[#F5A623]/40 transition-all duration-300 group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -z-10 transition-transform group-hover:scale-110 ${card.bg}`} />
              <div className="mb-2 h-10 flex items-center">
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200/60 animate-pulse rounded-lg" />
                ) : (
                  <p className={`text-4xl font-bold tracking-tight ${card.color}`}>{card.value}</p>
                )}
              </div>
              <p className="text-[14px] font-semibold text-[#6B5744] group-hover:text-[#2C1A0E] transition-colors">{card.label}</p>
            </Link>
          ))}
        </div>

        {/* Student report status */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#E8D5B7]/40 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#E8D5B7]/40 bg-[#FAFAF8]/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h2 className="font-bold text-[#2C1A0E] text-[15px] shrink-0">Current Period Report Status</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
              <div className="flex bg-[#E8D5B7]/20 p-1 rounded-full overflow-x-auto w-full sm:w-auto">
                <FilterButton value="all" label="All" />
                <FilterButton value="missing" label="Missing" />
                <FilterButton value="draft" label="Draft" />
                <FilterButton value="done" label="Done" />
                <FilterButton value="sent" label="Sent" />
              </div>
              <div className="relative w-full sm:w-64 shrink-0">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7662]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                  type="text" 
                  placeholder="Search student..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8D5B7]/60 rounded-full text-[13px] font-medium placeholder-[#8a7662] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] transition-all"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#6B5744]">
              <div className="w-6 h-6 border-2 border-[#E8D5B7] border-t-[#F5A623] rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium">Loading status...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 bg-[#F5A623]/10 text-[#F5A623] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              </div>
              <h3 className="text-[15px] font-bold text-[#2C1A0E] mb-1">No students found</h3>
              <p className="text-[13px] text-[#8a7662] max-w-sm">
                {searchQuery || filter !== 'all' 
                  ? "We couldn't find any students matching your current search or filter."
                  : "You haven't added any students yet. Manage students to get started."}
              </p>
              {(searchQuery || filter !== 'all') && (
                <button onClick={() => { setSearchQuery(''); setFilter('all'); }} className="mt-4 text-[#F5A623] text-[13px] font-bold hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#E8D5B7]/40">
              {filteredStudents.map(student => {
                const report = getReport(student.id)
                const status = report?.status ?? null
                return (
                  <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-3 hover:bg-[#FAFAF8]/50 transition-colors gap-3">
                    <div>
                      <p className="text-[15px] font-semibold text-[#2C1A0E]">{student.name}</p>
                      <p className="text-[13px] text-[#8a7662] mt-0.5">{student.program}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 ring-inset ${status ? (STATUS_STYLE[status] ?? 'bg-gray-100/80 text-gray-600 ring-gray-500/10') : 'bg-[#FDF8F3] text-[#A67C52] ring-[#E8D5B7]/60'}`}>
                        {status ? (STATUS_LABEL[status] ?? status) : 'Missing'}
                      </span>
                      {report && (
                        <Link href={`/admin/reports/${report.id}`} className="text-[13px] font-bold text-[#F5A623] hover:text-[#E09615] transition-colors bg-[#FAFAF8] px-3 py-1.5 rounded-lg border border-[#E8D5B7]/60 hover:bg-white hover:border-[#F5A623]/40 shadow-sm hover:shadow">
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
        <div className="flex gap-4 mt-8 px-2">
          <Link href="/admin/students" className="text-[13px] font-semibold text-[#F5A623] hover:text-[#E09615] transition-colors flex items-center gap-1">Manage Students <span aria-hidden="true">&rarr;</span></Link>
          <span className="text-[#E8D5B7]/60">|</span>
          <Link href="/admin/mentors" className="text-[13px] font-semibold text-[#F5A623] hover:text-[#E09615] transition-colors flex items-center gap-1">Manage Mentors <span aria-hidden="true">&rarr;</span></Link>
        </div>
      </main>
    </div>
  )
}
