'use client'

import { useEffect, useState } from 'react'
import AdminNav from '../_nav'

interface Student {
  id: string
  name: string
  program: string
  parent_email: string
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', program: '', parent_email: '' })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', program: '', parent_email: '' })
  const [saving, setSaving] = useState(false)

  const load = () =>
    fetch('/api/students').then(r => r.json()).then(setStudents).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

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
    setEditForm({ name: s.name, program: s.program, parent_email: s.parent_email })
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
      if (!res.ok) { setError((await res.json()).error || 'Failed to save'); return }
      const updated = await res.json()
      setStudents(prev => prev.map(s => s.id === id ? updated : s))
      setEditingId(null)
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await fetch('/api/students', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setStudents(prev => prev.filter(s => s.id !== id))
    } catch {
      setError('Failed to delete')
    }
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      <AdminNav />
      <main className="flex-1 p-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-[#2C1A0E] mb-6">Manage Students</h1>

        {/* Add form */}
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-[#E8D5B7] p-5 mb-6">
          <h2 className="text-sm font-semibold text-[#2C1A0E] mb-4">Add New Student</h2>
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-[#6B5744] mb-1">Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Student name"
                className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6B5744] mb-1">Program *</label>
              <input
                value={form.program}
                onChange={e => setForm(f => ({ ...f, program: e.target.value }))}
                placeholder="e.g. Matematika Dasar"
                className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs text-[#6B5744] mb-1">Parent Email</label>
            <input
              type="email"
              value={form.parent_email}
              onChange={e => setForm(f => ({ ...f, parent_email: e.target.value }))}
              placeholder="parent@email.com"
              className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
            />
          </div>
          <button
            type="submit"
            disabled={adding || !form.name.trim() || !form.program.trim()}
            className="bg-[#F5A623] text-[#2C1A0E] text-sm font-bold px-5 py-2 rounded-lg hover:bg-[#E09615] disabled:opacity-50 transition-colors"
          >
            {adding ? 'Adding...' : 'Add Student'}
          </button>
        </form>

        {/* List */}
        <div className="bg-white rounded-xl border border-[#E8D5B7]">
          <div className="px-5 py-4 border-b border-[#E8D5B7]">
            <h2 className="text-sm font-semibold text-[#2C1A0E]">{students.length} students</h2>
          </div>
          {loading ? (
            <p className="text-sm text-[#6B5744] p-5">Loading...</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-[#6B5744] p-5">No students yet.</p>
          ) : (
            <div className="divide-y divide-[#E8D5B7]">
              {students.map(s => (
                <div key={s.id}>
                  {editingId === s.id ? (
                    <div className="px-5 py-4 bg-[#FAFAF8] space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-[#6B5744] mb-1">Name *</label>
                          <input
                            value={editForm.name}
                            onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#6B5744] mb-1">Program *</label>
                          <input
                            value={editForm.program}
                            onChange={e => setEditForm(f => ({ ...f, program: e.target.value }))}
                            className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B5744] mb-1">Parent Email</label>
                        <input
                          type="email"
                          value={editForm.parent_email}
                          onChange={e => setEditForm(f => ({ ...f, parent_email: e.target.value }))}
                          className="w-full border border-[#E8D5B7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(s.id)}
                          disabled={saving || !editForm.name.trim() || !editForm.program.trim()}
                          className="bg-[#F5A623] text-[#2C1A0E] text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-[#E09615] disabled:opacity-50 transition-colors"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-[#6B5744] hover:text-[#2C1A0E] px-4 py-1.5 rounded-lg border border-[#E8D5B7] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-[#2C1A0E]">{s.name}</p>
                        <p className="text-xs text-[#6B5744]">{s.program} · {s.parent_email || '—'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => startEdit(s)}
                          className="text-xs text-[#F5A623] hover:text-[#E09615] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="text-xs text-red-500 hover:text-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
