'use client'

import { useEffect, useState } from 'react'
import AdminNav from '../_nav'
import { useConfirm } from '@/components/ConfirmModal'
import LoadingState from '@/components/LoadingState'

interface Student {
  id: string
  name: string
  program: string
  parent_email: string
  status: 'active' | 'archived' | string
}

export default function AdminStudentsPage() {
  const { confirm, ConfirmDialog } = useConfirm()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'active' | 'archived' | 'all'>('active')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', program: '', parent_email: '' })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', program: '', parent_email: '', status: 'active' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    fetch('/api/students?status=all')
      .then(r => r.json())
      .then(setStudents)
      .catch(() => setError('Failed to load students'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.program.trim()) return
    setAdding(true)
    setError('')
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        setError((await res.json()).error || 'Failed to add')
        return
      }
      setForm({ name: '', program: '', parent_email: '' })
      load()
    } catch {
      setError('Failed to add student')
    } finally {
      setAdding(false)
    }
  }

  const startEdit = (s: Student) => {
    setEditingId(s.id)
    setEditForm({
      name: s.name,
      program: s.program,
      parent_email: s.parent_email || '',
      status: s.status || 'active',
    })
  }

  const handleSaveEdit = async (id: string) => {
    if (!editForm.name.trim() || !editForm.program.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) {
        setError((await res.json()).error || 'Failed to save')
        return
      }
      const updated = await res.json()
      setStudents(prev => prev.map(s => (s.id === id ? updated : s)))
      setEditingId(null)
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (s: Student) => {
    const isCurrentlyActive = s.status === 'active'
    const newStatus = isCurrentlyActive ? 'archived' : 'active'

    const ok = await confirm({
      title: isCurrentlyActive ? 'Deactivate Student' : 'Activate Student',
      message: isCurrentlyActive
        ? `Deactivate "${s.name}"? The student will be hidden from mentor dropdowns, but all historical session recaps, monthly reports, and parent emails will be safely preserved.`
        : `Activate "${s.name}"? The student will become active again and available in mentor session recaps and monthly reports.`,
      confirmText: isCurrentlyActive ? 'Deactivate' : 'Activate',
      variant: isCurrentlyActive ? 'danger' : 'primary',
    })
    if (!ok) return

    try {
      const res = await fetch(`/api/admin/students/${s.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        setError('Failed to update student status')
        return
      }
      const updated = await res.json()
      setStudents(prev => prev.map(item => (item.id === s.id ? updated : item)))
    } catch {
      setError('Failed to update student status')
    }
  }

  const activeCount = students.filter(s => s.status === 'active').length
  const archivedCount = students.filter(s => s.status === 'archived').length

  const filteredStudents = students.filter(s => {
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'archived'
        ? s.status === 'archived'
        : s.status === 'active'

    const matchesSearch =
      !search.trim() ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.program.toLowerCase().includes(search.toLowerCase()) ||
      (s.parent_email && s.parent_email.toLowerCase().includes(search.toLowerCase()))

    return matchesStatus && matchesSearch
  })

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FAFAF8] text-[#2C1A0E]">
      <AdminNav />
      <ConfirmDialog />
      <main className="flex-1 p-5 md:p-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2C1A0E]">Manage Students</h1>
            <p className="text-xs text-[#6B5744] mt-1">
              Add students, edit profiles, or manage active & inactive status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● {activeCount} Active
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
              ○ {archivedCount} Inactive
            </span>
          </div>
        </div>

        {/* Add form */}
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-[#E8D5B7] p-5 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#2C1A0E] mb-4">Add New Student</h2>
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={() => setError('')} className="text-red-500 font-bold ml-2">✕</button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-[#6B5744] mb-1">Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Student name"
                className="w-full border border-[#E8D5B7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] bg-[#FAFAF8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B5744] mb-1">Program *</label>
              <input
                value={form.program}
                onChange={e => setForm(f => ({ ...f, program: e.target.value }))}
                placeholder="e.g. Teman Belajar / Kryacademia"
                className="w-full border border-[#E8D5B7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] bg-[#FAFAF8]"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#6B5744] mb-1">Parent Email</label>
            <input
              type="email"
              value={form.parent_email}
              onChange={e => setForm(f => ({ ...f, parent_email: e.target.value }))}
              placeholder="parent@email.com"
              className="w-full border border-[#E8D5B7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] bg-[#FAFAF8]"
            />
          </div>
          <button
            type="submit"
            disabled={adding || !form.name.trim() || !form.program.trim()}
            className="bg-[#F5A623] text-[#2C1A0E] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#E09615] disabled:opacity-50 transition-colors shadow-sm"
          >
            {adding ? 'Adding...' : '+ Add Student'}
          </button>
        </form>

        {/* List Section with Filter Tabs */}
        <div className="bg-white rounded-2xl border border-[#E8D5B7] shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E8D5B7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#FAFAF8] border border-[#E8D5B7]/60 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filterStatus === 'active'
                    ? 'bg-[#F5A623] text-[#2C1A0E] shadow-sm'
                    : 'text-[#6B5744] hover:text-[#2C1A0E]'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('archived')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filterStatus === 'archived'
                    ? 'bg-[#F5A623] text-[#2C1A0E] shadow-sm'
                    : 'text-[#6B5744] hover:text-[#2C1A0E]'
                }`}
              >
                Inactive ({archivedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-[#F5A623] text-[#2C1A0E] shadow-sm'
                    : 'text-[#6B5744] hover:text-[#2C1A0E]'
                }`}
              >
                All ({students.length})
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search student or email..."
                className="w-full sm:w-64 border border-[#E8D5B7] rounded-xl px-3 py-1.5 pl-8 text-xs focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
              />
              <svg
                className="w-3.5 h-3.5 text-[#B0957A] absolute left-2.5 top-2.5 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {loading ? (
            <LoadingState className="py-20" />
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-[#6B5744]">
              <p className="text-sm font-medium">No students found matching your filter.</p>
              <p className="text-xs text-[#B0957A] mt-1">
                {filterStatus === 'archived'
                  ? 'No inactive students currently archived.'
                  : 'Try changing your search keyword or tab filter.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8D5B7]/40">
              {filteredStudents.map(s => {
                const isActive = s.status === 'active'
                return (
                  <div key={s.id}>
                    {editingId === s.id ? (
                      <div className="p-5 bg-[#FAFAF8] space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#6B5744] mb-1">Name *</label>
                            <input
                              value={editForm.name}
                              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                              className="w-full border border-[#E8D5B7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#6B5744] mb-1">Program *</label>
                            <input
                              value={editForm.program}
                              onChange={e => setEditForm(f => ({ ...f, program: e.target.value }))}
                              className="w-full border border-[#E8D5B7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] bg-white"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-[#6B5744] mb-1">Parent Email</label>
                            <input
                              type="email"
                              value={editForm.parent_email}
                              onChange={e => setEditForm(f => ({ ...f, parent_email: e.target.value }))}
                              className="w-full border border-[#E8D5B7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#6B5744] mb-1">Status</label>
                            <select
                              value={editForm.status}
                              onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                              className="w-full border border-[#E8D5B7] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] bg-white"
                            >
                              <option value="active">Active</option>
                              <option value="archived">Inactive (Archived)</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(s.id)}
                            disabled={saving || !editForm.name.trim() || !editForm.program.trim()}
                            className="bg-[#F5A623] text-[#2C1A0E] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#E09615] disabled:opacity-50 transition-colors shadow-sm"
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-xs font-medium text-[#6B5744] hover:text-[#2C1A0E] px-4 py-2 rounded-xl border border-[#E8D5B7] bg-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-5 gap-3 hover:bg-[#FAFAF8]/50 transition-colors">
                        <div className="flex items-start sm:items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-[#2C1A0E]">{s.name}</p>
                              {isActive ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#6B5744] mt-0.5">
                              {s.program} · <span className="text-[#8a7662]">{s.parent_email || 'No parent email'}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => startEdit(s)}
                            className="text-xs font-semibold text-[#F5A623] hover:text-[#E09615] px-2.5 py-1 rounded-lg border border-[#E8D5B7]/60 hover:bg-[#FAF3E8] transition-colors"
                          >
                            Edit
                          </button>

                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(s)}
                              className="text-xs font-semibold text-amber-700 hover:text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
                              title="Hide from mentor dropdowns while keeping all past data"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(s)}
                              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                              title="Make student active again for mentors"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
